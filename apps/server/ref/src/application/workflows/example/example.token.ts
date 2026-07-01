/**
 * Payment Cancel Workflow Tokens
 *
 * Symbol-based tokens for refactor-safe references.
 */

// Workflow token
export const EXAMPLE_WORKFLOW = Symbol('example-workflow');

// Activity tokens
export const STEP_ONE = Symbol('step-one');
export const STEP_TWO = Symbol('step-two');
export const STEP_THREE = Symbol('step-three');

// Compensating Activity tokens
export const COMPENSATE_STEP_ONE = Symbol('compensate-step-one');
export const COMPENSATE_STEP_TWO = Symbol('compensate-step-two');
export const COMPENSATE_STEP_THREE = Symbol('compensate-step-three');
