import { Injectable, Logger } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import {
	IPaymentProvider,
	IPaymentProviderCreateResult,
	IPaymentProviderField,
	IPaymentProviderMetadata,
	IPaymentProviderResult,
	IPaymentProviderWebhookResult,
} from '@/core';
import { ECurrency } from '@/core';
import {
	IMomoConfirmRequest,
	IMomoConfirmResponse,
	IMomoCreateRequest,
	IMomoCreateResponse,
	IMomoIpn,
	IMomoMetadata,
	IMomoRawSignatureConfirm,
	IMomoRawSignatureCreate,
	IMomoRawSignatureCreateSubscription,
	IMomoRawSignatureCreateWithSubscription,
	IMomoRawSignatureCreateWithSubscriptionWebhook,
	IMomoRawSignatureRefund,
	IMomoRawSignatureWebhook,
} from './interfaces';
import { generateUUID, hashSHA256 } from '@/shared/utils/hash';
import type { JsonRecord } from '@/shared/types';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { getErrorMessage, toError } from '@/shared/utils/error.util';
import { getMomoResultGroup, getMomoResultMessage } from './exceptions';
import { EMomoConfirmType, EMomoLanguage } from './enums';
import { IMomoCreateWithSubscriptionRequest } from './interfaces/momo-subscription.interface';

@Injectable()
export class MomoService implements IPaymentProvider {
	constructor(private readonly httpService: HttpService) {}
	private readonly logger = new Logger(MomoService.name);
	code = 'momo';
	ORDER_ID_PREFIX = 'MOMO_';
	REQUEST_TYPE = 'payWithMethod' as const;
	LANG = EMomoLanguage.VI;
	CREDENTIAL_FIELDS = [
		{
			key: 'partner_code',
			label: 'Partner Code',
			required: true,
		},
		{
			key: 'access_key',
			label: 'Access Key',
			required: true,
		},
		{
			key: 'secret_key',
			label: 'Secret Key',
			required: true,
			description: 'Provided in MoMo Business Dashboard',
		},
		{
			key: 'partner_name',
			label: 'Partner Name',
			required: false,
			description: 'Provided in MoMo Business Dashboard',
		},
		{
			key: 'store_id',
			label: 'Store ID',
			required: false,
			description: 'Provided in MoMo Business Dashboard',
		},
		{
			key: 'store_name',
			label: 'Store Name',
			required: false,
			description: 'Provided in MoMo Business Dashboard',
		},
	];

	getCredentialFields(): IPaymentProviderField[] {
		return this.CREDENTIAL_FIELDS;
	}

	checkCredentialFields(credentials: JsonRecord): boolean {
		return this.CREDENTIAL_FIELDS.every(
			(field) => credentials[field.key] !== undefined && credentials[field.key] !== null
		);
	}

	async create(
		id: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult> {
		try {
			const {
				accessKey,
				secretKey,
				partnerCode,
				storeId,
				storeName,
				url,
				redirectUrl,
				ipnUrl,
			} = this.validateMetadata(metadata);
			console.log({
				accessKey,
				secretKey,
				partnerCode,
				storeId,
				storeName,
				url,
				redirectUrl,
				ipnUrl,
			});
			const requestId = generateUUID();
			const orderInfo = 'pay with MoMo';
			const requestType = this.REQUEST_TYPE;
			const orderMomoId = this.generateMomoOrderId(id);
			const extraData = '';
			const lang: 'vi' | 'en' = this.LANG;

			// Tạo signature để xác thực request với MoMo
			const signature = this.buildSignature(
				{
					accessKey,
					amount,
					extraData,
					ipnUrl,
					orderId: orderMomoId,
					orderInfo,
					partnerCode,
					redirectUrl,
					requestId,
					requestType,
				},
				secretKey
			);

			const requestBody: IMomoCreateRequest = {
				partnerCode,
				storeId,
				storeName,
				requestId,
				amount: amount,
				orderId: orderMomoId,
				redirectUrl,
				ipnUrl,
				lang,
				requestType,
				orderInfo,
				extraData,
				signature,
				autoCapture: false,
			};

			this.logger.debug('Momo Request Body:', requestBody);

			// Gửi request đến MoMo API để tạo thanh toán
			const requestTimestamp = new Date();
			const response = await firstValueFrom(
				this.httpService.post(`${url}/create`, requestBody, {
					headers: { 'Content-Type': 'application/json' },
					timeout: 30000,
				})
			);
			if (response.status !== 200) {
				throw new Error(`Momo create payment failed with status code ${response.status}`);
			}
			const responseBody = response.data as IMomoCreateResponse;
			if (responseBody.resultCode !== 0) {
				throw new Error(`[Code: ${responseBody.resultCode}]: ${responseBody.message}`);
			}
			const { status, message } = this.transformStatus(responseBody.resultCode);

			const result: IPaymentProviderCreateResult = {
				requestPayload: requestBody as unknown as JsonRecord,
				responsePayload: responseBody as unknown as JsonRecord,
				data: {
					isSuccess: true,
					status,
					errorMessage: status === 'failed' ? message : undefined,
				},
				paymentUrl: responseBody.payUrl ?? '',
				requestTimestamp,
				responseTimestamp: new Date(responseBody.responseTime ?? Date.now()),
			};
			return result;
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(isAxiosError(error) ? error.response?.data : error));
			throw toError(error);
		}
	}

	async capture(
		transactionId: string,
		attemptId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult> {
		try {
			const { accessKey, secretKey, partnerCode, url } = this.validateMetadata(metadata);
			const momoOrderId = this.generateMomoOrderId(attemptId);
			const requestTimestamp = new Date();
			const { requestPayload, responsePayload } = await this.momoConfirm(
				accessKey,
				secretKey,
				partnerCode,
				url,
				momoOrderId,
				amount,
				EMomoConfirmType.CAPTURE
			);
			const { status, message } = this.transformStatus(responsePayload.resultCode);
			return {
				requestPayload: requestPayload as unknown as JsonRecord,
				responsePayload: responsePayload as unknown as JsonRecord,
				requestTimestamp,
				responseTimestamp: new Date(responsePayload.responseTime ?? Date.now()),
				data: {
					isSuccess: status === 'succeeded',
					status,
					errorMessage: status === 'failed' ? message : undefined,
				},
			};
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(error));
			throw toError(error);
		}
	}

	async refund(
		_transactionId: string,
		_amount: number,
		_currency: ECurrency,
		_metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult> {
		return {
			requestPayload: {},
			responsePayload: {},
			requestTimestamp: new Date(),
			responseTimestamp: new Date(),
			data: {
				isSuccess: true,
				status: 'pending',
				errorMessage: undefined,
			},
		};
	}

	async cancel(
		transactionId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult> {
		const { accessKey, secretKey, partnerCode, url } = this.validateMetadata(metadata);
		const attemptId = metadata?.others?.attempt_id;
		if (typeof attemptId !== 'string') {
			throw new Error('No attemptId found in metadata');
		}
		const momoOrderId = this.generateMomoOrderId(attemptId);
		const requestTimestamp = new Date();
		const { requestPayload, responsePayload } = await this.momoConfirm(
			accessKey,
			secretKey,
			partnerCode,
			url,
			momoOrderId,
			amount,
			EMomoConfirmType.CANCEL
		);
		const { status, message } = this.transformStatus(responsePayload.resultCode);
		return {
			requestPayload: requestPayload as unknown as JsonRecord,
			responsePayload: responsePayload as unknown as JsonRecord,
			data: {
				isSuccess: status === 'succeeded',
				status,
				errorMessage: status === 'failed' ? message : undefined,
			},
			requestTimestamp: requestTimestamp,
			responseTimestamp: new Date(responsePayload.responseTime ?? Date.now()),
		};
	}

	async query(
		_transactionId: string,
		_metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult> {
		return {
			requestPayload: {},
			responsePayload: {},
			requestTimestamp: new Date(),
			responseTimestamp: new Date(),
			data: {
				isSuccess: true,
				status: 'pending',
				errorMessage: undefined,
			},
		};
	}

	parseWebhook(
		data: JsonRecord,
		_metadata?: IPaymentProviderMetadata
	): IPaymentProviderWebhookResult {
		const ipn = data as unknown as IMomoIpn;
		let isSuccess: boolean;
		let status: 'authorized' | 'succeeded' | 'pending' | 'failed';
		let errorMessage: string | undefined = undefined;
		const response = {
			statusCode: 204,
			payload: undefined,
		};
		try {
			if (ipn.resultCode === 9000) {
				isSuccess = true;
				status = 'authorized';
			} else if (ipn.resultCode === 0) {
				isSuccess = true;
				status = 'succeeded';
			} else if (getMomoResultGroup(ipn.resultCode) === 'processing') {
				isSuccess = true;
				status = 'pending';
			} else {
				isSuccess = false;
				status = 'failed';
				errorMessage = getMomoResultMessage(ipn.resultCode);
			}
			return {
				action: 'payment',
				amount: ipn.amount,
				currency: ECurrency.VND,
				data: {
					transactionId: ipn.transId.toString(),
					isSuccess,
					status,
					errorMessage,
				},
				rawPayload: data,
				response,
			};
		} catch (error) {
			this.logger.error(error);
			throw toError(error);
		}
	}

	verifyWebhook(data: JsonRecord, metadata?: IPaymentProviderMetadata): boolean {
		if (!metadata?.credentials) {
			return false;
		}
		const momoMeta = metadata as IMomoMetadata;
		const ipn = data as unknown as IMomoIpn;
		const {
			access_key: accessKey,
			secret_key: secretKey,
			partner_code: partnerCode,
		} = momoMeta.credentials;
		if (
			ipn.orderId === undefined ||
			ipn.signature === undefined ||
			ipn.resultCode === undefined ||
			ipn.requestId === undefined ||
			ipn.transId === undefined ||
			ipn.amount === undefined
		) {
			return false;
		}

		const rawSignature: IMomoRawSignatureWebhook = {
			accessKey,
			amount: ipn.amount,
			extraData: ipn.extraData,
			message: ipn.message,
			orderId: ipn.orderId,
			orderInfo: ipn.orderInfo,
			orderType: ipn.orderType,
			partnerCode,
			payType: ipn.payType,
			requestId: ipn.requestId,
			responseTime: ipn.responseTime,
			resultCode: ipn.resultCode,
			transId: ipn.transId,
		};
		console.log(rawSignature);
		const signature = this.buildSignature(rawSignature, secretKey);
		if (signature !== ipn.signature) {
			return false;
		}
		console.log(signature, ipn.signature);

		return true;
	}

	extractPaymentAttemptId(data: JsonRecord): string {
		return this.extractFromMomoOrderId((data as unknown as IMomoIpn).orderId);
	}

	private async momoConfirm(
		accessKey: string,
		secretKey: string,
		partnerCode: string,
		momoUrl: string,
		orderId: string,
		amount: number,
		requestType: EMomoConfirmType
	): Promise<{ requestPayload: IMomoConfirmRequest; responsePayload: IMomoConfirmResponse }> {
		try {
			const requestId = generateUUID();
			// Tạo request body cho confirm
			const description = 'Payment confirmation';

			const signature = this.buildSignature(
				{
					accessKey,
					amount,
					description,
					orderId,
					partnerCode,
					requestId,
					requestType,
				},
				secretKey
			);

			const bodyConfirm: IMomoConfirmRequest = {
				partnerCode,
				requestId,
				orderId,
				requestType,
				lang: EMomoLanguage.VI,
				amount,
				description,
				signature,
			};

			const resultConfirm = await firstValueFrom(
				this.httpService.post(`${momoUrl}/confirm`, bodyConfirm)
			);

			if (resultConfirm.status.toString()[0] !== '2') {
				throw new Error(getErrorMessage(resultConfirm.data));
			}

			const response: IMomoConfirmResponse = resultConfirm.data as IMomoConfirmResponse;

			return {
				requestPayload: bodyConfirm,
				responsePayload: response,
			};
		} catch (error: unknown) {
			const detail: unknown = isAxiosError(error)
				? (error.response?.data ?? error.message)
				: error;
			this.logger.error(`[Momo Confirm Error] ${getErrorMessage(detail)}`);
			throw toError(error);
		}
	}

	async createWithSubscription(
		id: string,
		tenantId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult> {
		try {
			const {
				accessKey,
				secretKey,
				partnerCode,
				storeId,
				storeName: _storeName,
				url,
				redirectUrl,
				ipnUrl,
			} = this.validateMetadata(metadata);

			const requestId = generateUUID();
			const orderInfo = 'pay with MoMo';
			const requestType = 'subscription';
			const orderMomoId = this.generateMomoOrderId(id);
			const extraData = '';
			const lang: 'vi' | 'en' = this.LANG;

			// Tạo signature để xác thực request với MoMo
			const signature = this.buildSignature(
				{
					accessKey,
					amount,
					extraData,
					ipnUrl,
					orderId: orderMomoId,
					orderInfo,
					partnerClientId: tenantId,
					partnerCode,
					redirectUrl,
					requestId,
					requestType,
				},
				secretKey
			);

			const requestBody: IMomoCreateWithSubscriptionRequest = {
				partnerCode,
				storeId,
				requestId,
				amount: amount,
				orderId: orderMomoId,
				partnerClientId: tenantId,
				redirectUrl,
				ipnUrl,
				lang,
				requestType,
				orderInfo,
				extraData,
				signature,
			};

			this.logger.debug('Momo Request Body:', requestBody);

			// Gửi request đến MoMo API để tạo thanh toán
			const requestTimestamp = new Date();
			const response = await firstValueFrom(
				this.httpService.post(`${url}/create`, requestBody, {
					headers: { 'Content-Type': 'application/json' },
					timeout: 30000,
				})
			);
			if (response.status !== 200) {
				throw new Error(`Momo create payment failed with status code ${response.status}`);
			}
			const responseBody = response.data as IMomoCreateResponse;
			if (responseBody.resultCode !== 0) {
				throw new Error(`[Code: ${responseBody.resultCode}]: ${responseBody.message}`);
			}
			const { status, message } = this.transformStatus(responseBody.resultCode);

			const result: IPaymentProviderCreateResult = {
				requestPayload: requestBody as unknown as JsonRecord,
				responsePayload: responseBody as unknown as JsonRecord,
				data: {
					isSuccess: true,
					status,
					errorMessage: status === 'failed' ? message : undefined,
				},
				paymentUrl: responseBody.payUrl ?? '',
				requestTimestamp,
				responseTimestamp: new Date(responseBody.responseTime ?? Date.now()),
			};
			return result;
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(isAxiosError(error) ? error.response?.data : error));
			throw toError(error);
		}
	}

	private validateMetadata(metadata: IPaymentProviderMetadata | undefined) {
		const m = metadata as IMomoMetadata | undefined;
		console.log(m);
		if (!m?.credentials) {
			throw new Error('No credentials found in metadata');
		}
		if (!m.credentials.access_key) {
			throw new Error('No accessKey found in metadata');
		}
		if (!m.credentials.secret_key) {
			throw new Error('No secretKey found in metadata');
		}
		if (!m.credentials.partner_code) {
			throw new Error('No partnerCode found in metadata');
		}
		if (!m.url) {
			throw new Error('No url found in metadata');
		}
		// if (!metadata.redirect_url) {
		// 	throw new Error('No redirectUrl found in metadata');
		// }
		if (!m.webhookUrl) {
			throw new Error('No webhookUrl found in metadata');
		}
		console.log(m);
		return {
			accessKey: m.credentials.access_key,
			secretKey: m.credentials.secret_key,
			partnerCode: m.credentials.partner_code,
			storeId: m.credentials.store_id || '',
			storeName: m.credentials.store_name || '',
			url: m.url,
			redirectUrl: m.redirectUrl || '',
			ipnUrl: m.webhookUrl,
		};
	}

	private generateMomoOrderId(id: string): string {
		return `${this.ORDER_ID_PREFIX}${id}`;
	}

	private extractFromMomoOrderId(orderId: string): string {
		return orderId.replace(this.ORDER_ID_PREFIX, '');
	}

	private buildSignature(
		body:
			| IMomoRawSignatureCreate
			| IMomoRawSignatureConfirm
			| IMomoRawSignatureRefund
			| IMomoRawSignatureWebhook
			| IMomoRawSignatureCreateWithSubscription
			| IMomoRawSignatureCreateSubscription
			| IMomoRawSignatureCreateWithSubscriptionWebhook,
		secretKey: string
	): string {
		const rawSignature = Object.entries(body)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([key, value]) => `${key}=${value}`)
			.join('&');
		return hashSHA256(rawSignature, secretKey);
	}

	private transformStatus(code: number): {
		status: 'succeeded' | 'failed' | 'pending';
		message: string;
	} {
		const status = getMomoResultGroup(code);
		const message = getMomoResultMessage(code);
		if (status === 'success') return { status: 'succeeded', message };
		if (status === 'error' || status === 'unknown') return { status: 'failed', message };
		return { status: 'pending', message };
	}
}
