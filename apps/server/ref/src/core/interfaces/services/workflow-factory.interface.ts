export const WORKFLOW_FACTORY = Symbol('IWorkflowFactory');

export interface IWorkflowFactory {
	getWorkflowToken(eventType: string): symbol | null;
}
