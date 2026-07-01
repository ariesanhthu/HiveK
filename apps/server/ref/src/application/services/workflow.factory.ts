import { Injectable } from '@nestjs/common';
import { PAYMENT_CAPTURE_WORKFLOW, SUBSCRIPTION_UPDATE_WORKFLOW } from '@/application/workflows';
import { type IWorkflowFactory } from '@/core/interfaces';

@Injectable()
export class WorkflowFactory implements IWorkflowFactory {
	getWorkflowToken(eventType: string): symbol | null {
		switch (eventType) {
			case 'CapturePaymentRequest':
				return PAYMENT_CAPTURE_WORKFLOW;
			case 'UpdateSubscription':
				return SUBSCRIPTION_UPDATE_WORKFLOW;
			default:
				return null;
		}
	}
}
