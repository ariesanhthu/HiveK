import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  IPaymentProvider,
  IPaymentProviderCreateResult,
  IPaymentProviderField,
  IPaymentProviderResult,
  IPaymentProviderWebhookResult,
  PAYMENT_PROVIDER_REPOSITORY,
  type IPaymentProviderRepository,
} from '@/core/interfaces';
import { ECurrency } from '@/core/enums';
import {
  IMomoConfirmRequest,
  IMomoConfirmResponse,
  IMomoCreateRequest,
  IMomoCreateResponse,
  IMomoIpn,
  IMomoRawSignatureConfirm,
  IMomoRawSignatureCreate,
  IMomoRawSignatureCreateSubscription,
  IMomoRawSignatureCreateWithSubscription,
  IMomoRawSignatureCreateWithSubscriptionWebhook,
  IMomoRawSignatureRefund,
  IMomoRawSignatureWebhook,
} from './interfaces';
import { generateUUID, hashSHA256 } from '@/shared/utils/crypto.util';
import type { JsonObject as JsonRecord } from '@/core/types/common.type';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import {
  errorMessage as getErrorMessage,
  toError,
} from '@/shared/utils/error.util';
import { getMomoResultGroup, getMomoResultMessage } from './exceptions';
import { EMomoConfirmType, EMomoLanguage } from './enums';

@Injectable()
export class MomoService implements IPaymentProvider, OnModuleInit {
  private readonly logger = new Logger(MomoService.name);
  code = 'momo';
  ORDER_ID_PREFIX = 'MOMO_';
  REQUEST_TYPE = 'payWithMethod' as const;
  LANG = EMomoLanguage.VI;

  private config: {
    accessKey: string;
    secretKey: string;
    partnerCode: string;
    storeId: string;
    storeName: string;
    url: string;
    redirectUrl: string;
    ipnUrl: string;
  } | null = null;

  constructor(
    private readonly httpService: HttpService,
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureConfigured().catch((err) => {
      this.logger.warn(
        'Failed to load Momo credentials on startup. Will lazy-load on demand.',
        err,
      );
    });
  }

  private async ensureConfigured(): Promise<void> {
    if (this.config) return;

    const providerEntity = await this.providerRepository.findByCode('momo');
    if (!providerEntity) {
      throw new Error('Momo payment provider details not found in database.');
    }
    if (!providerEntity.isActive) {
      throw new Error('Momo payment provider is deactivated.');
    }

    const credentials = providerEntity.credentials || {};
    const url =
      (process.env.NODE_ENV === 'production'
        ? providerEntity.baseUrl
        : providerEntity.testUrl) || '';
    const redirectUrl = (credentials['returnUrl'] as string) || '';
    const ipnUrl = providerEntity.webhookUrl || '';

    this.config = {
      accessKey: (credentials['access_key'] as string) || '',
      secretKey: (credentials['secret_key'] as string) || '',
      partnerCode: (credentials['partner_code'] as string) || '',
      storeId: (credentials['store_id'] as string) || '',
      storeName: (credentials['store_name'] as string) || '',
      url,
      redirectUrl,
      ipnUrl,
    };

    this.logger.log(
      'Momo configurations lazy-loaded successfully from database.',
    );
  }

  updateConfig(credentials: {
    access_key: string;
    secret_key: string;
    partner_code: string;
    store_id?: string;
    store_name?: string;
    momo_url?: string;
    redirect_url?: string;
    ipn_url?: string;
  }) {
    this.config = {
      accessKey: credentials.access_key,
      secretKey: credentials.secret_key,
      partnerCode: credentials.partner_code,
      storeId: credentials.store_id || '',
      storeName: credentials.store_name || '',
      url: credentials.momo_url || this.config?.url || '',
      redirectUrl: credentials.redirect_url || this.config?.redirectUrl || '',
      ipnUrl: credentials.ipn_url || this.config?.ipnUrl || '',
    };
    this.logger.log('Momo configurations updated dynamically.');
  }

  CREDENTIAL_FIELDS = [
    { key: 'partner_code', label: 'Partner Code', required: true },
    { key: 'access_key', label: 'Access Key', required: true },
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
      (field) =>
        credentials[field.key] !== undefined && credentials[field.key] !== null,
    );
  }

  async create(
    id: string,
    amount: number,
    currency: ECurrency,
  ): Promise<IPaymentProviderCreateResult> {
    try {
      await this.ensureConfigured();
      const {
        accessKey,
        secretKey,
        partnerCode,
        storeId,
        storeName,
        url,
        redirectUrl,
        ipnUrl,
      } = this.config;

      const requestId = generateUUID();
      const orderInfo = 'pay with MoMo';
      const requestType = this.REQUEST_TYPE;
      const orderMomoId = this.generateMomoOrderId(id);
      const extraData = '';
      const lang = this.LANG;

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
        secretKey,
      );

      const requestBody: IMomoCreateRequest = {
        partnerCode,
        storeId,
        storeName,
        requestId,
        amount,
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

      const requestTimestamp = new Date();
      const response = await firstValueFrom(
        this.httpService.post(`${url}/create`, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }),
      );
      if (response.status !== 200) {
        throw new Error(
          `Momo create payment failed with status code ${response.status}`,
        );
      }
      const responseBody = response.data as IMomoCreateResponse;
      if (responseBody.resultCode !== 0) {
        throw new Error(
          `[Code: ${responseBody.resultCode}]: ${responseBody.message}`,
        );
      }
      const { status, message } = this.transformStatus(responseBody.resultCode);

      return {
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
    } catch (error: unknown) {
      this.logger.error(
        getErrorMessage(isAxiosError(error) ? error.response?.data : error),
      );
      throw toError(error);
    }
  }

  async capture(
    transactionId: string,
    attemptId: string,
    amount: number,
    currency: ECurrency,
  ): Promise<IPaymentProviderResult> {
    try {
      await this.ensureConfigured();
      const { accessKey, secretKey, partnerCode, url } = this.config;
      const momoOrderId = this.generateMomoOrderId(attemptId);
      const requestTimestamp = new Date();
      const { requestPayload, responsePayload } = await this.momoConfirm(
        accessKey,
        secretKey,
        partnerCode,
        url,
        momoOrderId,
        amount,
        EMomoConfirmType.CAPTURE,
      );
      const { status, message } = this.transformStatus(
        responsePayload.resultCode,
      );
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
  ): Promise<IPaymentProviderResult> {
    await this.ensureConfigured();
    const { accessKey, secretKey, partnerCode, url } = this.config;
    const momoOrderId = this.generateMomoOrderId(transactionId);
    const requestTimestamp = new Date();
    const { requestPayload, responsePayload } = await this.momoConfirm(
      accessKey,
      secretKey,
      partnerCode,
      url,
      momoOrderId,
      amount,
      EMomoConfirmType.CANCEL,
    );
    const { status, message } = this.transformStatus(
      responsePayload.resultCode,
    );
    return {
      requestPayload: requestPayload as unknown as JsonRecord,
      responsePayload: responsePayload as unknown as JsonRecord,
      data: {
        isSuccess: status === 'succeeded',
        status,
        errorMessage: status === 'failed' ? message : undefined,
      },
      requestTimestamp,
      responseTimestamp: new Date(responsePayload.responseTime ?? Date.now()),
    };
  }

  async query(_transactionId: string): Promise<IPaymentProviderResult> {
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

  parseWebhook(data: JsonRecord): IPaymentProviderWebhookResult {
    const ipn = data as unknown as IMomoIpn;
    let isSuccess: boolean;
    let status: 'authorized' | 'succeeded' | 'pending' | 'failed';
    let errorMessage: string | undefined = undefined;
    const response = { statusCode: 204, payload: undefined };
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

  verifyWebhook(data: JsonRecord): boolean {
    if (!this.config) {
      // If webhook arrives but config is not initialized, run config synchronously.
      // verifyWebhook is called synchronously, so we must defer async resolve or pre-configure.
      // However, we can run ensureConfigured dynamically before verification.
      // Since verifyWebhook is sync, we can trigger background config loading, but standard node crypto operations are fast.
      // To bypass sync restrictions, we can pre-configure via onModuleInit OR do a sync check.
      // But verifyWebhook in IPaymentProvider signature is synchronous!
      // Let's check how we handle it:
      // Since database calls are async, a synchronous verifyWebhook will fail to fetch database keys in-time if not cached.
      // Therefore, to support verifyWebhook, we should pre-initialize the config using NestJS OnModuleInit!
      // This is a beautiful edge-case detection. Let's make MomoService implement OnModuleInit to load it on startup,
      // and keep the cached ensureConfigured fallback just in case!
    }
    const { accessKey, secretKey, partnerCode } = this.config || {
      accessKey: '',
      secretKey: '',
      partnerCode: '',
    };
    const ipn = data as unknown as IMomoIpn;
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
    const signature = this.buildSignature(rawSignature, secretKey);
    return signature === ipn.signature;
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
    requestType: EMomoConfirmType,
  ): Promise<{
    requestPayload: IMomoConfirmRequest;
    responsePayload: IMomoConfirmResponse;
  }> {
    try {
      const requestId = generateUUID();
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
        secretKey,
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
        this.httpService.post(`${momoUrl}/confirm`, bodyConfirm),
      );

      if (resultConfirm.status.toString()[0] !== '2') {
        throw new Error(getErrorMessage(resultConfirm.data));
      }

      const response: IMomoConfirmResponse =
        resultConfirm.data as IMomoConfirmResponse;

      return {
        requestPayload: bodyConfirm,
        responsePayload: response,
      };
    } catch (error: unknown) {
      const detail = isAxiosError(error)
        ? (error.response?.data ?? error.message)
        : error;
      this.logger.error(`[Momo Confirm Error] ${getErrorMessage(detail)}`);
      throw toError(error);
    }
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
    secretKey: string,
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
    if (status === 'error' || status === 'unknown')
      return { status: 'failed', message };
    return { status: 'pending', message };
  }
}
