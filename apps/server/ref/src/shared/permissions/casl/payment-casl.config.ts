import type { CaslModuleOptions } from '@sgod-casl/library';
import { IS_PUBLIC_KEY } from '@/presentation/decorators/public.decorator';
import { PaymentPermissionProvider } from './payment-permission.provider';

export const paymentCaslModuleOptions: CaslModuleOptions = {
	permissionProviderClass: PaymentPermissionProvider,
	composition: {
		serviceName: 'payment',
		stackGuestBaseLayer: true,
		sgodManageAll: true,
		anonymousGuestAbility: true,
		publicMetadataKey: IS_PUBLIC_KEY,
	},
	defaultPolicy: 'allow',
};
