import { Entity } from '@/core/abstract';
import { type ECurrency } from '@/core/enums';
import { type EPaymentMethod } from '../enums';
import { type Optional } from '@/core/types';
import type { JsonRecord } from '@/shared/types';

export interface PaymentProviderProps {
	code: string;
	displayName: string;
	supportedMethods: EPaymentMethod[];
	supportedCurrencies: ECurrency[];
	credentials: JsonRecord; // Encrypted
	isActive: boolean;
	supportsWebhook: boolean;
	supportsRefund: boolean;
	supportsPartialRefund: boolean;
	baseUrl: Optional<string>;
	testUrl: Optional<string>;
	webhookUrl: Optional<string>;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Optional<Date>;
	deletedBy: Optional<string>;
}

export type PaymentProviderCreateProps = Omit<
	PaymentProviderProps,
	| 'baseUrl'
	| 'testUrl'
	| 'webhookUrl'
	| 'createdAt'
	| 'updatedAt'
	| 'deletedAt'
	| 'deletedBy'
> & {
	baseUrl?: Optional<string>;
	testUrl?: Optional<string>;
	webhookUrl?: Optional<string>;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Optional<Date>;
	deletedBy?: Optional<string>;
};

export class PaymentProviderEntity extends Entity<PaymentProviderProps> {
	public static create(input: PaymentProviderCreateProps, id?: string): PaymentProviderEntity {
		const now = new Date();
		return new PaymentProviderEntity({
			...input,
			baseUrl: input.baseUrl,
			testUrl: input.testUrl,
			webhookUrl: input.webhookUrl,
			createdAt: input.createdAt ?? now,
			updatedAt: input.updatedAt ?? now,
			deletedAt: input.deletedAt,
			deletedBy: input.deletedBy,
		}, id);
	}

	public static instantiate(id: string, props: PaymentProviderProps): PaymentProviderEntity {
		return new PaymentProviderEntity(props, id);
	}

	private constructor(props: PaymentProviderProps, id?: string) {
		super(props, id);
	}

	get code() {
		return this.props.code;
	}
	get displayName() {
		return this.props.displayName;
	}
	get supportedMethods() {
		return this.props.supportedMethods;
	}
	get supportedCurrencies() {
		return this.props.supportedCurrencies;
	}
	get credentials() {
		return this.props.credentials;
	}
	get isActive() {
		return this.props.isActive;
	}
	get supportsWebhook() {
		return this.props.supportsWebhook;
	}
	get supportsRefund() {
		return this.props.supportsRefund;
	}
	get supportsPartialRefund() {
		return this.props.supportsPartialRefund;
	}
	get baseUrl(): Optional<string> {
		return this.props.baseUrl;
	}
	get testUrl(): Optional<string> {
		return this.props.testUrl;
	}
	get webhookUrl(): Optional<string> {
		return this.props.webhookUrl;
	}
	get createdAt() {
		return this.props.createdAt;
	}
	get updatedAt() {
		return this.props.updatedAt;
	}
	get deletedAt(): Optional<Date> {
		return this.props.deletedAt;
	}
	get deletedBy(): Optional<string> {
		return this.props.deletedBy;
	}
	isDeleted() {
		return !!this.props.deletedAt;
	}

	set displayName(value: string) {
		this.props.displayName = value;
	}
	set supportedMethods(value: EPaymentMethod[]) {
		this.props.supportedMethods = value;
	}
	set supportedCurrencies(value: ECurrency[]) {
		this.props.supportedCurrencies = value;
	}
	set credentials(value: JsonRecord) {
		this.props.credentials = value;
	}
	set isActive(value: boolean) {
		this.props.isActive = value;
	}
	set supportsWebhook(value: boolean) {
		this.props.supportsWebhook = value;
	}
	set supportsRefund(value: boolean) {
		this.props.supportsRefund = value;
	}
	set supportsPartialRefund(value: boolean) {
		this.props.supportsPartialRefund = value;
	}
	set baseUrl(value: string) {
		this.props.baseUrl = value;
	}
	set testUrl(value: string) {
		this.props.testUrl = value;
	}
	set webhookUrl(value: string) {
		this.props.webhookUrl = value;
	}
	set updatedAt(value: Date) {
		this.props.updatedAt = value;
	}
	set deletedAt(value: Date) {
		this.props.deletedAt = value;
	}
	set deletedBy(value: string) {
		this.props.deletedBy = value;
	}
	maskAsDeleted(deletedBy: string) {
		this.props.deletedAt = new Date();
		this.props.deletedBy = deletedBy;
	}
}
