# Temporal Infrastructure Layer - Implementation Guide

> Temporal-specific implementation of the durable execution framework. Maps provider-agnostic interfaces to Temporal APIs.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Component Guide](#component-guide)
5. [Configuration](#configuration)
6. [Worker Setup](#worker-setup)
7. [Workflow Registration](#workflow-registration)
8. [Activity Registration](#activity-registration)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This module bridges the gap between our **provider-agnostic shared layer** and **Temporal's workflow engine**. It handles:

- ✅ Workflow interpretation and execution
- ✅ Activity registration and discovery
- ✅ Option mapping (agnostic → Temporal)
- ✅ Error mapping (Temporal → agnostic)
- ✅ Heartbeat support for long-running activities
- ✅ SAGA compensation pattern
- ✅ Conditional steps and branching

### Key Principles

1. **Zero Application Code Changes** - Application layer uses only shared interfaces
2. **Automatic Registration** - Activities auto-discovered via `@Activity` decorator
3. **Type Safety** - Full TypeScript support with strict types
4. **Error Translation** - All Temporal errors mapped to `WorkflowError`
5. **Flexible Configuration** - Per-step, per-workflow, and system-level options

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  (Workflow Definitions, Activities, Business Logic)             │
└────────────────────────┬────────────────────────────────────────┘
                         │ Uses
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Shared Layer                                │
│  (WorkflowDefinition, ActivityOptions, Decorators, Errors)      │
└────────────────────────┬────────────────────────────────────────┘
                         │ Implemented by
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 Temporal Infrastructure (THIS LAYER)             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Workflows   │  │  Activities  │  │   Mappers    │          │
│  │              │  │              │  │              │          │
│  │ Interpreter  │  │  Heartbeat   │  │   Options    │          │
│  │   Logger     │  │   Wrapper    │  │    Error     │          │
│  │ Compensator  │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Registry   │  │    Config    │  │    Worker    │          │
│  │              │  │              │  │              │          │
│  │  Activities  │  │   Temporal   │  │   NestJS     │          │
│  │  Workflows   │  │   Settings   │  │ Integration  │          │
│  │   Domain     │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │ Communicates with
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Temporal Server                               │
│              (Workflow Engine, Task Queues)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
temporal/
├── activities/              # Activity utilities
│   ├── heartbeat-wrapper.ts    # Auto/manual heartbeat support
│   └── index.ts
│
├── workflows/
│   ├── interpreter/         # Workflow execution engine
│   │   ├── workflow-interpreter.ts      # Main interpreter
│   │   ├── workflow-logger.ts           # Temporal-safe logging
│   │   ├── activity-identifier-resolver.ts  # Symbol resolution
│   │   ├── compensation-executor.ts     # SAGA compensation
│   │   └── index.ts
│   └── index.ts
│
├── mappers/                 # Data transformers
│   ├── activity-options.mapper.ts   # Agnostic → Temporal options
│   ├── error.mapper.ts              # Temporal → WorkflowError
│   └── index.ts
│
├── registry/                # Registration & discovery
│   ├── domain/
│   │   └── payment/        # Domain-specific workflow wrappers
│   │       ├── payment-create.temporal.ts
│   │       ├── payment-capture.temporal.ts
│   │       ├── payment-cancel.temporal.ts
│   │       ├── payment-refund.temporal.ts
│   │       ├── payment-retry.temporal.ts
│   │       └── index.ts
│   ├── activity.registry.ts    # Activity discovery
│   ├── workflow.registry.ts    # Workflow registry
│   └── index.ts
│
├── config/                  # Configuration
│   ├── temporal.config.ts      # Temporal settings
│   └── index.ts
│
├── worker.ts                # Temporal worker
├── temporal-client.service.ts  # Client service
├── temporal.module.ts       # NestJS module
└── index.ts
```

---

## Quick Start

### 1. Prerequisites

Ensure you have:
- ✅ Temporal server running (local or cloud)
- ✅ Application activities defined with `@Activity` decorator
- ✅ Workflow definitions using `WorkflowDefinition` interface

### 2. Configure Temporal Connection

```typescript
// config/temporal.config.ts
export const TEMPORAL_CONFIG = {
  connection: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  },
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'payment-queue',

  // System-wide activity defaults
  systemActivityDefaults: {
    timeout: 60000,  // 1 minute
    scheduleToCloseTimeout: 300000,  // 5 minutes
    retryPolicy: {
      maxAttempts: 3,
      initialInterval: 1000,
      backoffCoefficient: 2.0,
    },
  },
};
```

### 3. Register Activities with Worker

```typescript
// worker.ts
import { NestFactory } from '@nestjs/core';
import { Worker } from '@temporalio/worker';
import { AppModule } from '@/app.module';
import { buildActivityMap } from './registry/activity.registry';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Build activity map from decorated classes
  const activities = buildActivityMap(app);

  // Start Temporal worker
  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_CONFIG.namespace,
    taskQueue: TEMPORAL_CONFIG.taskQueue,
    activities,
    workflowsPath: require.resolve('./registry/domain/payment'),
  });

  await worker.run();
}
```

### 4. Create Temporal Workflow Wrapper

```typescript
// registry/domain/payment/payment-create.temporal.ts
import { proxyActivities } from '@temporalio/workflow';
import { createWorkflowExecutor } from '../../../workflows/interpreter';
import { paymentCreateDefinition } from '@/application/payment/workflows/payment-create.workflow';

// Temporal workflow function
export async function PaymentCreateWorkflow(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
  const executor = createWorkflowExecutor(paymentCreateDefinition);
  return executor(input);
}
```

### 5. Execute Workflow from Application

```typescript
// temporal-client.service.ts
@Injectable()
export class TemporalClientService {
  async executeWorkflow<TInput, TOutput>(
    workflowDefinition: WorkflowDefinition<TInput, TOutput, any>,
    input: TInput,
  ): Promise<TOutput> {
    const handle = await this.client.workflow.start(workflowName, {
      taskQueue: TEMPORAL_CONFIG.taskQueue,
      args: [input],
      workflowId: generateWorkflowId(),
    });

    return handle.result();
  }
}
```

---

## Component Guide

### 1. Workflow Interpreter

**Location:** `workflows/interpreter/workflow-interpreter.ts`

The interpreter converts `WorkflowDefinition` objects into executable Temporal workflows.

#### Key Features

- ✅ **Conditional Steps** - Evaluates `when` predicates
- ✅ **Branching Logic** - First-match-wins branch selection
- ✅ **Per-Step Options** - Applies activity options dynamically
- ✅ **Compensation Tracking** - Records snapshots for rollback
- ✅ **Automatic Error Mapping** - Maps Temporal errors to WorkflowError before calling `onError`
- ✅ **Error Action Handling** - Supports compensate, retry, fail, continue actions
- ✅ **Heartbeat Configuration** - Tracks and logs heartbeat settings per-step
- ✅ **Async Error Handlers** - Supports both sync and async `onError` functions

#### Usage

```typescript
import { createWorkflowExecutor } from '@/infrastructure/durable-execution/temporal/workflows/interpreter';

// Create executor from definition
const executor = createWorkflowExecutor(myWorkflowDefinition);

// Use in Temporal workflow
export async function MyTemporalWorkflow(input: MyInput): Promise<MyOutput> {
  return executor(input);
}
```

#### Option Precedence (4 Levels)

1. **Branch Options** (highest priority) - For branching scenarios
2. **Step Options** - Per-step configuration
3. **Workflow Defaults** - From `defaultActivityOptions`
4. **System Defaults** (lowest priority) - From `TEMPORAL_CONFIG`

```typescript
// Example: Step options override workflow defaults
const definition: WorkflowDefinition = {
  defaultActivityOptions: {
    timeout: 30000,  // Workflow default
  },
  steps: [{
    name: 'long-running-step',
    activity: MY_ACTIVITY,
    activityOptions: {
      timeout: 120000,  // ✅ Overrides workflow default
    },
  }],
};
```

---

### 2. Activity Heartbeat Wrapper

**Location:** `activities/heartbeat-wrapper.ts`

Provides heartbeat support for long-running activities.

#### Auto-Heartbeat Mode (Default)

Automatically sends heartbeats at 80% of `heartbeatTimeout` interval.

```typescript
import { withHeartbeat } from '@/infrastructure/durable-execution/temporal/activities';

@Injectable()
@Activity(MY_ACTIVITY_TOKEN)
export class ProcessLargeFileActivity {
  async execute(input: ProcessInput): Promise<ProcessOutput> {
    // Heartbeats sent automatically every 24s (80% of 30s)
    for (let i = 0; i < input.fileSize; i++) {
      await processChunk(i);
    }
    return { processed: true };
  }
}

// Activity registration with auto-heartbeat
const activityFn = withHeartbeat(
  activityInstance.execute.bind(activityInstance),
  { heartbeatTimeout: 30000, autoHeartbeat: true }
);
```

#### Manual Heartbeat Mode

Inject `ActivityExecutionContext` for manual control.

```typescript
import { ActivityExecutionContext } from '@shared/durable-execution';

@Injectable()
@Activity(MY_ACTIVITY_TOKEN)
export class ProcessWithProgressActivity {
  async execute(
    input: ProcessInput,
    context: ActivityExecutionContext,  // ✅ Auto-injected
  ): Promise<ProcessOutput> {
    for (let i = 0; i < input.totalItems; i++) {
      await processItem(i);

      // Manual heartbeat with progress
      context.heartbeat({ processed: i + 1, total: input.totalItems });

      // Check cancellation
      if (context.isCancelled()) {
        throw new Error('Activity cancelled by user');
      }
    }
    return { processed: input.totalItems };
  }
}
```

#### Configuration

```typescript
activityOptions: {
  heartbeatTimeout: 30000,        // Max time between heartbeats
  autoHeartbeat: true,            // Enable auto-heartbeat (default)
  autoHeartbeatInterval: 24000,   // Optional: custom interval (default: 80% of heartbeatTimeout)
}
```

---

### 3. Activity Registry

**Location:** `registry/activity.registry.ts`

Discovers and registers activities using reflection metadata.

#### Auto-Discovery

```typescript
import { discoverActivities, buildActivityMap } from './registry/activity.registry';

// Discover all activities with @Activity decorator
const discovered = discoverActivities(moduleRef, [
  ValidatePaymentActivity,
  ChargeCardActivity,
  RefundCardActivity,
]);

console.log(discovered);
// Output:
// [
//   {
//     token: Symbol(validate-payment),
//     name: 'validate-payment',
//     activityClass: ValidatePaymentActivity,
//     executeFn: [Function: bound execute]
//   },
//   ...
// ]

// Build Temporal activity map
const activities = buildActivityMap(moduleRef);
// Output: { 'validate-payment': [Function], 'charge-card': [Function], ... }
```

#### Activity Lookup

```typescript
import { getActivityByToken, getActivityByName } from './registry/activity.registry';

// Lookup by symbol token
const activity = getActivityByToken(PAYMENT_ACTIVITIES.VALIDATE);

// Lookup by string name
const activity = getActivityByName('validate-payment');
```

---

### 4. Option Mapper

**Location:** `mappers/activity-options.mapper.ts`

Converts provider-agnostic options to Temporal-specific options.

#### Duration Conversion

```typescript
import { millisecondsToDuration } from './mappers/activity-options.mapper';

millisecondsToDuration(30000);   // "30s"
millisecondsToDuration(90000);   // "1m 30s"
millisecondsToDuration(3600000); // "1h"
```

#### Retry Policy Mapping

```typescript
import { toTemporalRetryPolicy } from './mappers/activity-options.mapper';

const agnosticPolicy = {
  maxAttempts: 5,
  initialInterval: 1000,
  backoffCoefficient: 2.0,
  maxInterval: 60000,
  nonRetriableErrors: ['ValidationError'],
};

const temporalPolicy = toTemporalRetryPolicy(agnosticPolicy);
// Output:
// {
//   maximumAttempts: 5,
//   initialInterval: '1s',
//   backoffCoefficient: 2.0,
//   maximumInterval: '1m',
//   nonRetryableErrorTypes: ['ValidationError']
// }
```

#### Activity Options Mapping

```typescript
import { toTemporalActivityOptions } from './mappers/activity-options.mapper';

const agnosticOptions = {
  timeout: 60000,
  scheduleToStartTimeout: 5000,
  scheduleToCloseTimeout: 300000,
  heartbeatTimeout: 30000,
  retryPolicy: { maxAttempts: 3 },
};

const temporalOptions = toTemporalActivityOptions(agnosticOptions);
// Output:
// {
//   startToCloseTimeout: '1m',
//   scheduleToStartTimeout: '5s',
//   scheduleToCloseTimeout: '5m',
//   heartbeatTimeout: '30s',
//   retry: { maximumAttempts: 3, ... }
// }
```

#### Option Merging

```typescript
import { mergeActivityOptions } from './mappers/activity-options.mapper';

const systemDefaults = { timeout: 30000, retryPolicy: { maxAttempts: 3 } };
const workflowDefaults = { timeout: 60000 };
const stepOptions = { heartbeatTimeout: 30000 };

const merged = mergeActivityOptions(stepOptions, workflowDefaults, systemDefaults);
// Output:
// {
//   timeout: 60000,              // From workflow
//   heartbeatTimeout: 30000,     // From step
//   retryPolicy: { maxAttempts: 3 }  // From system
// }
```

---

### 5. Error Mapper

**Location:** `mappers/error.mapper.ts`

Translates Temporal errors to shared layer `WorkflowError`.

#### Error Mapping

```typescript
import { mapTemporalError, safeMapError } from './mappers/error.mapper';
import { ApplicationFailure } from '@temporalio/common';

try {
  await temporalActivity();
} catch (error) {
  // Safe mapping with fallback
  const workflowError = safeMapError(error, { step: 'validate-payment' });

  console.log(workflowError.type);      // 'RETRIABLE' | 'NON_RETRIABLE' | 'TIMEOUT' | ...
  console.log(workflowError.message);   // Error message
  console.log(workflowError.details);   // { step: 'validate-payment', ... }
}
```

#### Supported Error Types

| Temporal Error | Mapped Type | Description |
|---------------|-------------|-------------|
| `ApplicationFailure` | `RETRIABLE` or `NON_RETRIABLE` | Activity execution failure |
| `ActivityFailure` | `RETRIABLE` | Activity wrapper failure |
| `TimeoutFailure` | `TIMEOUT` | Activity/workflow timeout |
| `CancelledFailure` | `CANCELLED` | Explicit cancellation |
| `TerminatedFailure` | `CANCELLED` | Workflow termination |
| `ChildWorkflowFailure` | Varies | Child workflow error |
| `ServerFailure` | `RETRIABLE` | Temporal server error |
| Generic `Error` | `UNKNOWN` | Unclassified errors |

#### Reverse Mapping

```typescript
import { toTemporalError } from './mappers/error.mapper';
import { WorkflowError } from '@shared/durable-execution';

const workflowError = WorkflowError.nonRetriable('Insufficient funds', null, {
  accountId: '123',
  balance: 50,
  required: 100,
});

// Convert to Temporal error for throwing in workflows
const temporalError = toTemporalError(workflowError);

throw temporalError;
// Throws: ApplicationFailure with type 'NON_RETRIABLE'
```

---

### 6. Compensation Executor

**Location:** `workflows/interpreter/compensation-executor.ts`

Implements SAGA compensation pattern with LIFO execution.

#### How It Works

1. **Snapshot Creation** - Before each compensable step executes, a snapshot is created
2. **LIFO Execution** - On failure, compensations run in reverse order (last-in, first-out)
3. **Best Effort** - Failed compensations are logged but don't block subsequent ones
4. **Context Snapshots** - Each compensation uses the context from its original execution

#### Example

```typescript
// Workflow definition
const definition: WorkflowDefinition = {
  steps: [
    {
      name: 'charge-card',
      activity: CHARGE_CARD,
      outputKey: 'chargeResult',
      compensation: {
        activity: REFUND_CARD,
        input: ctx => ({ transactionId: ctx.chargeResult.transactionId }),
      },
    },
    {
      name: 'update-ledger',
      activity: UPDATE_LEDGER,
      outputKey: 'ledgerResult',
      compensation: {
        activity: REVERSE_LEDGER,
        input: ctx => ({ entryId: ctx.ledgerResult.entryId }),
      },
    },
    {
      name: 'send-receipt',
      activity: SEND_RECEIPT,
      // No compensation (email can't be unsent)
    },
  ],
};

// Execution flow if 'send-receipt' fails:
// 1. Execute: charge-card ✅
// 2. Execute: update-ledger ✅
// 3. Execute: send-receipt ❌ (fails)
// 4. Compensate: reverse-ledger ✅ (uses ledgerResult from step 2)
// 5. Compensate: refund-card ✅ (uses chargeResult from step 1)
```

#### Compensation Best Practices

- ✅ **Idempotent** - Compensations should be safe to retry
- ✅ **Context Snapshots** - Use data from original execution, not current context
- ✅ **Best Effort** - Don't fail entire workflow if compensation fails
- ✅ **Logging** - Always log compensation attempts and results
- ❌ **Never Nested** - Don't create compensations for compensations

---

### 7. Workflow Logger

**Location:** `workflows/interpreter/workflow-logger.ts`

Temporal-safe logging utilities (prevents non-deterministic behavior).

#### Usage

```typescript
import { workflowLogger } from '../workflows/interpreter/workflow-logger';

export async function MyWorkflow(input: Input): Promise<Output> {
  workflowLogger.info('Workflow started', { workflowId: input.id });

  workflowLogger.debug('Processing step', { step: 'validate' });

  try {
    await executeActivity();
  } catch (error) {
    workflowLogger.error('Activity failed', { error: error.message });
    throw error;
  }

  return result;
}
```

#### Log Levels

- `workflowLogger.debug()` - Detailed debugging
- `workflowLogger.info()` - General information
- `workflowLogger.warn()` - Warnings
- `workflowLogger.error()` - Errors

**Note:** Logs are replayed during workflow replay. Use sparingly to avoid log spam.

---

## Configuration

### Temporal Connection

```typescript
// config/temporal.config.ts
export const TEMPORAL_CONFIG = {
  // Connection settings
  connection: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    tls: process.env.TEMPORAL_TLS === 'true' ? {
      clientCertPair: {
        crt: fs.readFileSync(process.env.TEMPORAL_TLS_CERT_PATH),
        key: fs.readFileSync(process.env.TEMPORAL_TLS_KEY_PATH),
      },
    } : undefined,
  },

  // Namespace and task queue
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'payment-queue',

  // System-wide activity defaults
  systemActivityDefaults: {
    timeout: 60000,  // 1 minute
    scheduleToCloseTimeout: 300000,  // 5 minutes
    scheduleToStartTimeout: 10000,   // 10 seconds
    retryPolicy: {
      maxAttempts: 3,
      initialInterval: 1000,
      backoffCoefficient: 2.0,
      maxInterval: 60000,
    },
  },
};
```

### Environment Variables

```bash
# .env
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=payment-queue
TEMPORAL_TLS=false

# Optional: TLS Configuration
TEMPORAL_TLS_CERT_PATH=/path/to/cert.pem
TEMPORAL_TLS_KEY_PATH=/path/to/key.pem
```

---

## Worker Setup

### Basic Worker

```typescript
// worker.ts
import { NestFactory } from '@nestjs/core';
import { Worker } from '@temporalio/worker';
import { AppModule } from '@/app.module';
import { TEMPORAL_CONFIG } from './config';
import { buildActivityMap } from './registry/activity.registry';

async function bootstrap() {
  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // Build activity map from decorated classes
  const activities = buildActivityMap(app);

  console.log(`Discovered ${Object.keys(activities).length} activities`);

  // Create Temporal connection
  const connection = await Connection.connect(TEMPORAL_CONFIG.connection);

  // Create and start worker
  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_CONFIG.namespace,
    taskQueue: TEMPORAL_CONFIG.taskQueue,
    activities,
    workflowsPath: require.resolve('./registry/domain/payment'),
  });

  console.log('Worker started successfully');

  await worker.run();
}

bootstrap().catch(console.error);
```

### Multiple Task Queues

```typescript
// Start workers for different task queues
async function startWorkers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connection = await Connection.connect(TEMPORAL_CONFIG.connection);

  // Payment worker
  const paymentWorker = await Worker.create({
    connection,
    namespace: TEMPORAL_CONFIG.namespace,
    taskQueue: 'payment-queue',
    activities: buildActivityMap(app, PaymentActivities),
    workflowsPath: require.resolve('./registry/domain/payment'),
  });

  // Wallet worker
  const walletWorker = await Worker.create({
    connection,
    namespace: TEMPORAL_CONFIG.namespace,
    taskQueue: 'wallet-queue',
    activities: buildActivityMap(app, WalletActivities),
    workflowsPath: require.resolve('./registry/domain/wallet'),
  });

  // Run both workers concurrently
  await Promise.all([
    paymentWorker.run(),
    walletWorker.run(),
  ]);
}
```

---

## Workflow Registration

### Step 1: Create Workflow Definition (Application Layer)

```typescript
// src/application/payment/workflows/payment-create.workflow.ts
import { WorkflowDefinition } from '@shared/durable-execution';
import { PAYMENT_ACTIVITIES } from '../activity-tokens';

export const paymentCreateDefinition: WorkflowDefinition<
  CreatePaymentInput,
  CreatePaymentOutput,
  CreatePaymentContext
> = {
  token: Symbol('PaymentCreateWorkflow'),
  name: 'PaymentCreateWorkflow',

  steps: [
    {
      name: 'validate',
      activity: PAYMENT_ACTIVITIES.VALIDATE,
      input: ctx => ctx.input,
      outputKey: 'validationResult',
    },
    {
      name: 'charge',
      activity: PAYMENT_ACTIVITIES.CHARGE_CARD,
      input: ctx => ({
        amount: ctx.input.amount,
        cardToken: ctx.input.cardToken,
      }),
      outputKey: 'chargeResult',
      compensation: {
        activity: PAYMENT_ACTIVITIES.REFUND_CARD,
        input: ctx => ({ transactionId: ctx.chargeResult.transactionId }),
      },
    },
  ],

  output: ctx => ({
    paymentId: ctx.chargeResult.paymentId,
    status: 'completed',
  }),
};
```

### Step 2: Create Temporal Wrapper (Infrastructure Layer)

```typescript
// registry/domain/payment/payment-create.temporal.ts
import { createWorkflowExecutor } from '../../../workflows/interpreter';
import { paymentCreateDefinition } from '@/application/payment/workflows/payment-create.workflow';

/**
 * Temporal workflow wrapper for payment creation.
 *
 * This is the actual Temporal workflow function that gets registered
 * with the worker. It uses the interpreter to execute the workflow definition.
 */
export async function PaymentCreateWorkflow(
  input: CreatePaymentInput,
): Promise<CreatePaymentOutput> {
  const executor = createWorkflowExecutor(paymentCreateDefinition);
  return executor(input);
}
```

### Step 3: Export from Domain Index

```typescript
// registry/domain/payment/index.ts
export * from './payment-create.temporal';
export * from './payment-capture.temporal';
export * from './payment-cancel.temporal';
export * from './payment-refund.temporal';
export * from './payment-retry.temporal';
```

### Step 4: Register with Workflow Registry

```typescript
// registry/workflow.registry.ts
import { Injectable } from '@nestjs/common';
import { WorkflowDefinition } from '@shared/durable-execution';
import { paymentCreateDefinition } from '@/application/payment/workflows/payment-create.workflow';

@Injectable()
export class WorkflowRegistry {
  private workflows = new Map<symbol, WorkflowDefinition<any, any, any>>();

  constructor() {
    this.register(paymentCreateDefinition);
    // Register other workflows...
  }

  register(definition: WorkflowDefinition<any, any, any>): void {
    this.workflows.set(definition.token, definition);
  }

  getByToken(token: symbol): WorkflowDefinition<any, any, any> | undefined {
    return this.workflows.get(token);
  }
}
```

---

## Activity Registration

Activities are **automatically discovered** via the `@Activity` decorator. No manual registration needed!

### Discovery Process

```typescript
// registry/activity.registry.ts

/**
 * 1. Scan for classes with @Activity decorator
 * 2. Extract token and name from metadata
 * 3. Resolve instance from NestJS DI container
 * 4. Bind execute method to instance
 * 5. Wrap with heartbeat support (if configured)
 */
export function discoverActivities(
  moduleRef: ModuleRef,
  activityClasses: Type<any>[],
): ActivityMetadata[] {
  return activityClasses
    .filter(hasActivityDecorator)
    .map(activityClass => {
      const token = getActivityToken(activityClass);
      const name = getActivityName(activityClass) || token.description;
      const instance = moduleRef.get(activityClass, { strict: false });
      const executeFn = instance.execute.bind(instance);

      return { token, name, activityClass, executeFn };
    });
}
```

### Activity Map Creation

```typescript
/**
 * Build Temporal activity map from discovered activities
 */
export function buildActivityMap(moduleRef: ModuleRef): Record<string, any> {
  const discovered = discoverActivities(moduleRef, ALL_ACTIVITY_CLASSES);

  const activityMap: Record<string, any> = {};

  for (const metadata of discovered) {
    // Wrap with heartbeat if needed
    const wrappedFn = shouldWrapWithHeartbeat(metadata)
      ? withHeartbeat(metadata.executeFn, getHeartbeatOptions(metadata))
      : metadata.executeFn;

    activityMap[metadata.name] = wrappedFn;
  }

  return activityMap;
}
```

### Usage in Worker

```typescript
// worker.ts
const activities = buildActivityMap(app);

// Activities now available in Temporal
// {
//   'validate-payment': [Function],
//   'charge-card': [Function],
//   'refund-card': [Function],
//   ...
// }
```

---

## Error Handling

### Understanding Error Handling Flow

**Critical:** The `onError` handler is called **only after all activity retry attempts are exhausted**. Temporal automatically retries activities based on their `retryPolicy` configuration.

```
Activity Execution Flow:
1. Activity executes
   ↓ (fails)
2. Temporal retries (attempt 2) - based on retryPolicy.maxAttempts
   ↓ (fails)
3. Temporal retries (attempt 3)
   ↓ (fails)
   ...
N. All retry attempts exhausted
   ↓
✅ onError() is called ← YOU ARE HERE
   ↓
Decision: compensate | fail | continue
```

### Workflow-Level Error Handler

**Note:** The workflow interpreter **automatically maps all Temporal errors** to `WorkflowError` before calling your `onError` handler.

```typescript
const definition: WorkflowDefinition = {
  // ... steps ...

  onError: (error, context, completedSteps) => {
    // ✅ error is already a WorkflowError with .type classification
    // No need to call safeMapError() - done automatically by interpreter!

    // Option 1: Fail permanently
    if (error.type === 'NON_RETRIABLE') {
      return 'fail';
    }

    // Option 2: Compensate (undo completed steps)
    if (completedSteps.length > 0) {
      return 'compensate';  // Rollback in LIFO order, then fail
    }

    // Option 3: Continue despite error (return partial result)
    if (isOptionalStep(error.stepName)) {
      return 'continue';
    }

    // Default: fail
    return 'fail';
  },
};
```

**Supported Error Actions:**
- `'fail'` - Permanently fail using `ApplicationFailure.nonRetryable` (stops retries)
- `'compensate'` - Execute SAGA compensation in reverse order (LIFO), then fail permanently
- `'continue'` - Ignore error and continue to next step (returns partial output)
- ~~`'retry'`~~ - **NOT SUPPORTED** - Use activity `retryPolicy` instead (see below)

**Important: Activity Retry vs Workflow Retry**

❌ **Wrong:** Returning `'retry'` from `onError` (non-standard)
```typescript
onError: () => 'retry' // Don't do this - causes infinite task retries
```

✅ **Correct:** Configure activity retry policy
```typescript
{
  name: 'validate',
  activity: VALIDATE_ACTIVITY,
  activityOptions: {
    retryPolicy: {
      maxAttempts: 5,        // ✅ Temporal retries automatically
      initialInterval: '1s',
      maximumInterval: '10s',
      backoffCoefficient: 2,
    },
  },
}
```

**How It Works:**
```typescript
// Inside workflow-interpreter.ts - automatic error mapping
try {
  // Execute workflow steps...
} catch (error) {
  // ✅ Automatically map to WorkflowError
  const workflowError = safeMapError(error, {
    stepName: definition.name,
    details: { phase: 'workflow-execution' },
  });

  // ✅ Call your handler with mapped error
  const action = definition.onError?.(workflowError, context, completedSteps);

  // ✅ Execute the action
  if (action === 'compensate' && completedSteps.length > 0) {
    await executeCompensations(completedSteps);
    // After compensation, fail permanently with ApplicationFailure.nonRetryable
    throw ApplicationFailure.nonRetryable(workflowError.message, 'WorkflowFailedAfterCompensation', workflowError);
  } else if (action === 'continue') {
    return partialResult;
  } else if (action === 'fail') {
    // Fail permanently with ApplicationFailure.nonRetryable
    throw ApplicationFailure.nonRetryable(workflowError.message, 'WorkflowExecutionError', workflowError);
  } else if (action === 'retry') {
    // Not supported - throws error with helpful message
    throw ApplicationFailure.nonRetryable('Use activity retry policies instead', 'UnsupportedRetryAction');
  }
}
```

### Activity-Level Error Handling

```typescript
@Injectable()
@Activity(MY_ACTIVITY_TOKEN)
export class MyActivity {
  async execute(input: MyInput): Promise<MyOutput> {
    try {
      const result = await dangerousOperation(input);
      return result;
    } catch (error) {
      // Throw WorkflowError for proper classification
      if (error instanceof InsufficientFundsError) {
        throw WorkflowError.nonRetriable('Insufficient funds', error, {
          accountId: input.accountId,
        });
      }

      if (error instanceof NetworkTimeoutError) {
        throw WorkflowError.retriable('Network timeout, retrying...', error);
      }

      // Unknown errors will be classified as UNKNOWN
      throw error;
    }
  }
}
```

### Retry Policy Configuration

```typescript
// Aggressive retry for network calls
activityOptions: {
  retryPolicy: {
    maxAttempts: 10,
    initialInterval: 1000,      // 1s
    backoffCoefficient: 2.0,    // Exponential backoff
    maxInterval: 60000,         // Max 1 minute between retries
  },
}

// Fast fail for validation
activityOptions: {
  retryPolicy: {
    maxAttempts: 1,  // No retries
  },
}
```

---

## Testing

### Unit Testing Activities

```typescript
import { Test } from '@nestjs/testing';
import { ValidatePaymentActivity } from './validate-payment.activity';

describe('ValidatePaymentActivity', () => {
  let activity: ValidatePaymentActivity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ValidatePaymentActivity],
    }).compile();

    activity = module.get(ValidatePaymentActivity);
  });

  it('should validate payment successfully', async () => {
    const input = { amount: 100, currency: 'USD', customerId: 'cust-123' };
    const result = await activity.execute(input);

    expect(result.valid).toBe(true);
    expect(result.paymentId).toBeDefined();
  });

  it('should throw validation error for negative amount', async () => {
    const input = { amount: -100, currency: 'USD', customerId: 'cust-123' };

    await expect(activity.execute(input)).rejects.toThrow('ValidationError');
  });
});
```

### Integration Testing Workflows

```typescript
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { PaymentCreateWorkflow } from './payment-create.temporal';

describe('PaymentCreateWorkflow', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  it('should create payment successfully', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: 'test-queue',
      workflowsPath: require.resolve('./payment-create.temporal'),
      activities: mockActivities,
    });

    await worker.runUntil(async () => {
      const result = await testEnv.client.workflow.execute(PaymentCreateWorkflow, {
        args: [{ amount: 100, currency: 'USD', customerId: 'cust-123' }],
        workflowId: 'test-workflow-1',
        taskQueue: 'test-queue',
      });

      expect(result.status).toBe('completed');
    });
  });
});
```

### Mocking Activities for Tests

```typescript
const mockActivities = {
  'validate-payment': async (input) => ({
    valid: true,
    paymentId: 'pay-123',
    validatedAt: new Date(),
  }),

  'charge-card': async (input) => ({
    transactionId: 'txn-456',
    status: 'success',
  }),
};
```

---

## Troubleshooting

### Problem: Worker can't find activities

**Symptoms:**
```
Error: Activity 'validate-payment' not found
```

**Solutions:**
1. Ensure activity class has `@Activity` decorator
2. Verify activity is included in `ALL_ACTIVITY_CLASSES` array
3. Check activity name matches workflow definition
4. Restart worker after code changes

```typescript
// Check if activity is discovered
const discovered = discoverActivities(moduleRef, ALL_ACTIVITY_CLASSES);
console.log('Discovered activities:', discovered.map(a => a.name));
```

---

### Problem: Workflow execution times out

**Symptoms:**
```
TimeoutFailure: Workflow execution timed out
```

**Solutions:**
1. Increase workflow timeout in client
2. Check if activities are hanging
3. Verify activity heartbeats are working
4. Review activity retry policies

```typescript
// Increase workflow timeout
await client.workflow.execute(MyWorkflow, {
  args: [input],
  workflowId: 'my-workflow-1',
  taskQueue: 'my-queue',
  workflowExecutionTimeout: '10m',  // ✅ Increase timeout
});
```

---

### Problem: Non-deterministic workflow error

**Symptoms:**
```
Non-deterministic workflow: Activity result differs from history
```

**Causes:**
- Using `Date.now()` or `Math.random()` in workflow code
- Calling external APIs directly in workflows
- Accessing environment variables in workflows

**Solutions:**
- Move all non-deterministic code to activities
- Use Temporal's `workflowInfo()` for workflow details
- Pass timestamps/random values as workflow inputs

```typescript
// ❌ BAD: Non-deterministic
export async function MyWorkflow(input: Input): Promise<Output> {
  const timestamp = Date.now();  // ❌ Non-deterministic!
  const random = Math.random();  // ❌ Non-deterministic!
}

// ✅ GOOD: Deterministic
export async function MyWorkflow(input: Input): Promise<Output> {
  // Pass timestamp as input
  const timestamp = input.timestamp;

  // Or use workflow start time
  const startTime = workflowInfo().startTime;
}
```

---

### Problem: Activity takes too long and times out

**Symptoms:**
```
TimeoutFailure: Activity execution timed out (type: START_TO_CLOSE)
```

**Solutions:**
1. Increase activity timeout
2. Add heartbeat support
3. Split activity into smaller chunks
4. Use async processing

```typescript
// Add heartbeat for long-running activity
{
  name: 'process-large-file',
  activity: PROCESS_FILE,
  activityOptions: {
    timeout: 600000,          // 10 minutes
    heartbeatTimeout: 30000,  // ✅ Add heartbeat
    autoHeartbeat: true,
  },
}
```

---

### Problem: Compensation not executing

**Symptoms:**
- Workflow fails but compensations don't run
- Only some compensations execute

**Solutions:**
1. Verify `onError` handler returns `'compensate'`
2. Check compensation activities are registered
3. Ensure compensation input function doesn't throw
4. Review compensation logs for failures

```typescript
// Enable compensation
onError: (error, context, completedSteps) => {
  console.log('Error occurred:', error.message);
  console.log('Completed steps:', completedSteps.length);

  if (completedSteps.length > 0) {
    return 'compensate';  // ✅ Ensure this is returned
  }

  return 'fail';
}
```

---

### Problem: Import errors in workflow code

**Symptoms:**
```
Error: Cannot find module '@/application/...' from workflow bundle
```

**Causes:**
- Temporal bundles workflow code separately
- Path aliases may not resolve correctly in bundle

**Solutions:**
1. Use relative imports in Temporal workflow wrappers
2. Configure webpack alias in worker
3. Keep workflow wrappers minimal (delegate to interpreter)

```typescript
// ❌ BAD: Path alias in workflow
import { paymentCreateDefinition } from '@/application/payment/workflows/payment-create.workflow';

// ✅ GOOD: Relative import
import { paymentCreateDefinition } from '../../../../application/payment/workflows/payment-create.workflow';

// ✅ BEST: Use interpreter (handles imports correctly)
import { createWorkflowExecutor } from '../../../workflows/interpreter';
const executor = createWorkflowExecutor(paymentCreateDefinition);
```

---

### Problem: Worker crashes on startup

**Symptoms:**
```
Error: Unable to connect to Temporal server
```

**Solutions:**
1. Verify Temporal server is running: `temporal server start-dev`
2. Check connection settings in `temporal.config.ts`
3. Verify network connectivity to Temporal server
4. Check namespace exists

```bash
# Start Temporal dev server
temporal server start-dev

# Create namespace (if needed)
temporal operator namespace create my-namespace
```

---

## Best Practices

### 1. Activity Design

✅ **DO:**
- Keep activities focused and single-purpose
- Use `@Activity` decorator with centralized tokens
- Add `@ActivityValidation` with Zod schemas
- Make activities idempotent
- Use heartbeats for long-running operations
- Handle errors gracefully with `WorkflowError`

❌ **DON'T:**
- Call other activities from within an activity
- Store state in activity class fields
- Use magic strings for activity names
- Ignore cancellation signals
- Throw generic errors without classification

---

### 2. Workflow Organization

✅ **DO:**
- Keep workflow definitions in application layer
- Use temporal wrappers in infrastructure layer
- Group workflows by domain (payment, wallet, etc.)
- Use centralized token files
- Document workflow purpose and steps

❌ **DON'T:**
- Mix business logic in Temporal wrappers
- Import activity classes in workflow definitions
- Create deep workflow nesting (>2 levels)
- Use workflow signals/queries unless necessary

---

### 3. Error Handling

✅ **DO:**
- Classify errors with `WorkflowError` types
- Implement `onError` handler for recovery logic
- Log errors with context information
- Use appropriate retry policies per activity type
- Test error scenarios

❌ **DON'T:**
- Swallow errors silently
- Retry non-retriable errors
- Fail entire workflow for minor errors
- Ignore compensation failures

---

### 4. Testing

✅ **DO:**
- Unit test activities independently
- Integration test workflows with mocked activities
- Test error scenarios and compensations
- Use `TestWorkflowEnvironment` for workflow tests
- Verify retry behavior

❌ **DON'T:**
- Test against production Temporal server
- Skip error path testing
- Test workflows without mocking activities
- Ignore non-determinism warnings

---

### 5. Performance

✅ **DO:**
- Use heartbeats for activities >30 seconds
- Batch operations when possible
- Set appropriate timeouts per activity
- Monitor workflow execution times
- Use task queues to distribute load

❌ **DON'T:**
- Create workflows for trivial operations (<5 activities)
- Use workflows for real-time synchronous APIs
- Ignore timeout warnings
- Run CPU-intensive code in workflows

---

## Additional Resources

- **Temporal Documentation:** https://docs.temporal.io/
- **Shared Layer README:** `../../../shared/durable-execution/README.md`
- **Architecture Guide:** `../../../../readme/architecture/DURABLEEXECUTION.md`
- **Temporal TypeScript SDK:** https://typescript.temporal.io/
- **NestJS Documentation:** https://docs.nestjs.com/

---

**Questions?** Contact the platform team or refer to inline documentation in source files.
