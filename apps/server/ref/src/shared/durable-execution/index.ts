/**
 * Shared Durable Execution Layer
 *
 * Provider-agnostic interfaces, decorators, and utilities for durable execution.
 *
 * This layer provides:
 * - Type-safe workflow definitions
 * - Runtime validation for activities (Zod)
 * - Provider-agnostic retry policies and options
 * - Error classification and handling
 * - Activity execution context (heartbeat, cancellation)
 *
 * Infrastructure layer (e.g., Temporal) implements these interfaces.
 */

export * from './interfaces';
export * from './decorators';
export * from './errors';
