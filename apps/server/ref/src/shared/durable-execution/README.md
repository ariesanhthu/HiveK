# Durable Execution - Application Guide

> Provider-agnostic durable execution framework for building reliable, resilient distributed workflows.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Step-by-Step Tutorial](#step-by-step-tutorial)
5. [Feature Guide](#feature-guide)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This shared layer provides a **provider-agnostic** abstraction for durable execution workflows. It ensures your application logic remains decoupled from specific workflow engines (like Temporal, Cadence, etc.).

### Key Features

✅ **Type-safe workflows** - Full TypeScript support with generics <br/>
✅ **Runtime validation** - Zod-based input/output validation <br/>
✅ **SAGA pattern** - Automatic compensation on failure <br/>
✅ **Conditional execution** - Skip steps based on runtime conditions <br/>
✅ **Branching logic** - Execute different paths based on data <br/>
✅ **Error handling** - Automatic classification and retry logic <br/>
✅ **Heartbeat support** - Long-running activity monitoring <br/>
✅ **Activity tokens** - Refactor-safe activity references <br/>

### Architecture

```
Application Layer (Your Code)
    ↓
Shared Layer (This package) ← Provider-agnostic
    ↓
Infrastructure Layer (Temporal, etc.) ← Provider-specific
```

---

## Quick Start

### 1. Install Dependencies

```bash
yarn add zod reflect-metadata
```

### 2. Create Your First Activity

```typescript
// src/application/payment/activities/validate-payment.activity.ts
import { Injectable } from '@nestjs/common';
import { Activity, ActivityValidation } from '@shared/durable-execution';
import { z } from 'zod';

// Define input/output schemas
const ValidatePaymentInputSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  customerId: z.string().uuid(),
});

const ValidatePaymentOutputSchema = z.object({
  valid: z.boolean(),
  paymentId: z.string().uuid(),
  validatedAt: z.date(),
});

// Define types from schemas
type ValidatePaymentInput = z.infer<typeof ValidatePaymentInputSchema>;
type ValidatePaymentOutput = z.infer<typeof ValidatePaymentOutputSchema>;

@Injectable()
@Activity(PAYMENT_ACTIVITY_TOKENS.VALIDATE_PAYMENT) // Use centralized token
@ActivityValidation({
  input: ValidatePaymentInputSchema,
  output: ValidatePaymentOutputSchema,
})
export class ValidatePaymentActivity {
  async execute(input: ValidatePaymentInput): Promise<ValidatePaymentOutput> {
    // Input is automatically validated
    // Business logic here
    const paymentId = generateUUID();

    // Output will be automatically validated
    return {
      valid: true,
      paymentId,
      validatedAt: new Date(),
    };
  }
}
```

### 3. Define Activity Tokens (Centralized)

```typescript
// src/application/payment/activity-tokens.ts
export const PAYMENT_ACTIVITY_TOKENS = {
  VALIDATE_PAYMENT: Symbol('ValidatePayment'),
  PROCESS_PAYMENT: Symbol('ProcessPayment'),
  REFUND_PAYMENT: Symbol('RefundPayment'),
} as const;
```

### 4. Define Your Workflow

```typescript
// src/application/payment/workflows/payment-create.workflow.ts
import { WorkflowDefinition } from '@shared/durable-execution';
import { PAYMENT_ACTIVITY_TOKENS } from '../activity-tokens';

interface PaymentInput {
  amount: number;
  currency: string;
  customerId: string;
}

interface PaymentOutput {
  paymentId: string;
  status: 'completed';
}

export const CreatePaymentWorkflow: WorkflowDefinition<PaymentInput, PaymentOutput> = {
  token: Symbol('create-payment'),
  name: 'Create Payment',

  steps: [
    {
      name: 'validate',
      activity: PAYMENT_ACTIVITY_TOKENS.VALIDATE_PAYMENT, // ✅ Token only, no class import
      input: ctx => ctx.input,
      outputKey: 'validation',
    },
  ],

  output: ctx => ({
    paymentId: ctx.validation.paymentId,
    status: 'completed',
  }),
};
```

### 5. Use Token in Activity Implementation

```typescript
// src/application/payment/activities/validate-payment.activity.ts
import { Activity } from '@shared/durable-execution';
import { PAYMENT_ACTIVITY_TOKENS } from '../activity-tokens';

@Injectable()
@Activity(PAYMENT_ACTIVITY_TOKENS.VALIDATE_PAYMENT) // ✅ Use centralized token
@ActivityValidation({
  input: ValidatePaymentInputSchema,
  output: ValidatePaymentOutputSchema,
})
export class ValidatePaymentActivity {
  async execute(input: ValidatePaymentInput): Promise<ValidatePaymentOutput> {
    // Implementation can change without affecting workflow definition
    // ...
  }
}
```

### 6. Execute the Workflow

```typescript
// src/application/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { IDurableExecutionClient } from '@shared/durable-execution';
import { CreatePaymentWorkflow } from './workflows';

@Injectable()
export class PaymentService {
  constructor(
    private readonly workflowClient: IDurableExecutionClient,
  ) {}

  async createPayment(amount: number, currency: string, customerId: string) {
    const result = await this.workflowClient.execute(CreatePaymentWorkflow, {
      input: { amount, currency, customerId },
      workflowId: `payment-${Date.now()}`,
    });

    return result;
  }
}
```

---

## Core Concepts

### 1. Activities

Activities are **individual units of work** that contain business logic. They should be:
- ✅ Idempotent (safe to retry)
- ✅ Stateless (no shared state between calls)
- ✅ Validated (use `@ActivityValidation`)
- ✅ Token-based (use `@Activity` decorator)

```typescript
// activity-tokens.ts
export const MY_DOMAIN_TOKENS = {
  MY_ACTIVITY: Symbol('MyActivity'),
} as const;

// my-activity.ts
@Injectable()
@Activity(MY_DOMAIN_TOKENS.MY_ACTIVITY) // ✅ Use centralized token
@ActivityValidation({ input: InputSchema, output: OutputSchema })
export class MyActivity {
  async execute(input: MyInput): Promise<MyOutput> {
    // Business logic
    return output;
  }
}
```

### 2. Workflows

Workflows are **sequences of activities** that define the business process. They contain:
- **Steps**: Ordered list of activities to execute
- **Context**: Shared data passed between steps
- **Compensation**: Rollback logic for failures
- **Error handling**: Recovery strategies

```typescript
const myWorkflow: WorkflowDefinition = {
  token: Symbol('my-workflow'),
  name: 'My Workflow',
  steps: [/* ... */],
  onError: (error, context, completedSteps) => {
    // Error handling logic
    return 'compensate';
  },
};
```

### 3. Compensation (SAGA Pattern)

Compensation allows **automatic rollback** of completed steps when a workflow fails:

```typescript
{
  name: 'charge-card',
  activity: Symbol('charge-card'),
  compensation: {
    activity: Symbol('refund-card'),
    input: ctx => ({ transactionId: ctx.chargeResult.transactionId }),
  },
}
```

**Execution order**: LIFO (Last In, First Out)
- Step 3 fails → Compensate Step 2 → Compensate Step 1

---

## Step-by-Step Tutorial

Let's build a **complete payment processing workflow** with all features.

### Step 1: Define Activity Tokens (Token-First Approach)

**✨ Best Practice:** Create centralized token files to decouple workflows from activity implementations.

```typescript
// src/application/payment/activity-tokens.ts
export const PAYMENT_ACTIVITIES = {
  VALIDATE: Symbol('validate-payment'),
  CHECK_FRAUD: Symbol('check-fraud'),
  CHARGE_CARD: Symbol('charge-card'),
  CHARGE_WALLET: Symbol('charge-wallet'),
  UPDATE_LEDGER: Symbol('update-ledger'),
  SEND_RECEIPT: Symbol('send-receipt'),

  // Compensations
  REFUND_CARD: Symbol('refund-card'),
  REFUND_WALLET: Symbol('refund-wallet'),
  REVERSE_LEDGER: Symbol('reverse-ledger'),
} as const;
```

**Why centralized tokens?**
- ✅ **Decoupling**: Workflows only import tokens, not activity classes
- ✅ **Temporal Best Practice**: Separate workflow/activity code (no direct imports)
- ✅ **Maintainability**: Change activity implementation without touching workflows
- ✅ **Type Safety**: TypeScript ensures token consistency across files
- ✅ **Domain Organization**: Group tokens by bounded context

```typescript
// ✅ RECOMMENDED: Token-first approach
// workflow-definition.ts
import { PAYMENT_ACTIVITIES } from './activity-tokens';
activity: PAYMENT_ACTIVITIES.VALIDATE // No activity class import!

// ❌ AVOID: Class-based approach (tight coupling)
// workflow-definition.ts
import { ValidatePaymentActivity } from './activities/validate-payment.activity';
activity: getActivityToken(ValidatePaymentActivity) // Imports implementation
```

### Step 2: Implement Activities

#### Validation Activity (Simple)

```typescript
// src/application/payment/activities/validate-payment.activity.ts
import { Injectable } from '@nestjs/common';
import { Activity, ActivityValidation } from '@shared/durable-execution';
import { z } from 'zod';
import { PAYMENT_ACTIVITIES } from '../workflows/payment.tokens';

const InputSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  customerId: z.string(),
});

const OutputSchema = z.object({
  valid: z.boolean(),
  paymentId: z.string(),
});

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

@Injectable()
@Activity(PAYMENT_ACTIVITIES.VALIDATE)
@ActivityValidation({ input: InputSchema, output: OutputSchema })
export class ValidatePaymentActivity {
  async execute(input: Input): Promise<Output> {
    // Validation logic
    return {
      valid: true,
      paymentId: `pay_${Date.now()}`,
    };
  }
}
```

#### Fraud Check Activity (With Heartbeat)

```typescript
// src/application/payment/activities/check-fraud.activity.ts
import { Injectable } from '@nestjs/common';
import { Activity, ActivityValidation, ActivityExecutionContext } from '@shared/durable-execution';
import { z } from 'zod';
import { PAYMENT_ACTIVITIES } from '../workflows/payment.tokens';

const InputSchema = z.object({
  paymentId: z.string(),
  amount: z.number(),
  customerId: z.string(),
});

const OutputSchema = z.object({
  approved: z.boolean(),
  riskScore: z.number(),
});

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

@Injectable()
@Activity(PAYMENT_ACTIVITIES.CHECK_FRAUD)
@ActivityValidation({ input: InputSchema, output: OutputSchema })
export class CheckFraudActivity {
  constructor(private readonly fraudService: FraudService) {}

  async execute(
    input: Input,
    context?: ActivityExecutionContext,
  ): Promise<Output> {
    // Long-running fraud check with progress reporting
    const checks = ['device', 'location', 'velocity', 'pattern'];

    for (let i = 0; i < checks.length; i++) {
      // Report progress
      context?.heartbeat({
        step: checks[i],
        progress: (i + 1) / checks.length
      });

      // Check for cancellation
      if (context?.isCancelled()) {
        throw new Error('Fraud check cancelled');
      }

      await this.fraudService.runCheck(checks[i], input);
    }

    return {
      approved: true,
      riskScore: 0.15,
    };
  }
}
```

#### Charge Card Activity (With Compensation)

```typescript
// src/application/payment/activities/charge-card.activity.ts
import { Injectable } from '@nestjs/common';
import { Activity, ActivityValidation } from '@shared/durable-execution';
import { z } from 'zod';
import { PAYMENT_ACTIVITIES } from '../workflows/payment.tokens';

const InputSchema = z.object({
  amount: z.number(),
  cardToken: z.string(),
});

const OutputSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
  chargedAt: z.date(),
});

@Injectable()
@Activity(PAYMENT_ACTIVITIES.CHARGE_CARD)
@ActivityValidation({ input: InputSchema, output: OutputSchema })
export class ChargeCardActivity {
  constructor(private readonly paymentProvider: PaymentProviderService) {}

  async execute(input: z.infer<typeof InputSchema>) {
    const result = await this.paymentProvider.charge({
      amount: input.amount,
      cardToken: input.cardToken,
    });

    return {
      transactionId: result.id,
      amount: result.amount,
      chargedAt: new Date(),
    };
  }
}
```

#### Refund Card Activity (Compensation)

```typescript
// src/application/payment/activities/refund-card.activity.ts
import { Injectable } from '@nestjs/common';
import { Activity, ActivityValidation } from '@shared/durable-execution';
import { z } from 'zod';
import { PAYMENT_ACTIVITIES } from '../workflows/payment.tokens';

const InputSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
});

const OutputSchema = z.object({
  refundId: z.string(),
  refundedAt: z.date(),
});

@Injectable()
@Activity(PAYMENT_ACTIVITIES.REFUND_CARD)
@ActivityValidation({ input: InputSchema, output: OutputSchema })
export class RefundCardActivity {
  constructor(private readonly paymentProvider: PaymentProviderService) {}

  async execute(input: z.infer<typeof InputSchema>) {
    // Compensation must be idempotent
    const existingRefund = await this.paymentProvider.findRefund(input.transactionId);
    if (existingRefund) {
      return {
        refundId: existingRefund.id,
        refundedAt: existingRefund.createdAt,
      };
    }

    const refund = await this.paymentProvider.refund({
      transactionId: input.transactionId,
      amount: input.amount,
    });

    return {
      refundId: refund.id,
      refundedAt: new Date(),
    };
  }
}
```

### Step 3: Define Complete Workflow

```typescript
// src/application/payment/workflows/payment-process.workflow.ts
import {
  WorkflowDefinition,
  getActivityToken,
  toWorkflowError,
  ErrorType
} from '@shared/durable-execution';
import {
  ValidatePaymentActivity,
  CheckFraudActivity,
  ChargeCardActivity,
  ChargeWalletActivity,
  UpdateLedgerActivity,
  SendReceiptActivity,
  RefundCardActivity,
  RefundWalletActivity,
  ReverseLedgerActivity,
} from '../activities';

interface PaymentInput {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethod: 'card' | 'wallet';
  cardToken?: string;
  walletId?: string;
  email?: string;
  sendReceipt?: boolean;
}

interface PaymentOutput {
  paymentId: string;
  transactionId: string;
  amount: number;
  status: 'completed';
}

export const PaymentProcessWorkflow: WorkflowDefinition<PaymentInput, PaymentOutput> = {
  token: Symbol('payment-process'),
  name: 'Payment Processing Workflow',

  // Default options for all activities
  defaultActivityOptions: {
    timeout: 30000, // 30 seconds
    retryPolicy: {
      maxAttempts: 3,
      initialInterval: 1000,
      backoffCoefficient: 2,
    },
  },

  steps: [
    // Step 1: Validate payment
    {
      name: 'validate',
      activity: getActivityToken(ValidatePaymentActivity),
      input: ctx => ({
        amount: ctx.input.amount,
        currency: ctx.input.currency,
        customerId: ctx.input.customerId,
      }),
      outputKey: 'validation',
      activityOptions: {
        timeout: 5000,
        retryPolicy: { maxAttempts: 1 }, // No retry for validation
      },
    },

    // Step 2: Fraud check (conditional - only for high amounts)
    {
      name: 'fraud-check',
      activity: getActivityToken(CheckFraudActivity),
      when: ctx => ctx.input.amount > 1000, // Skip if amount <= 1000
      input: ctx => ({
        paymentId: ctx.validation.paymentId,
        amount: ctx.input.amount,
        customerId: ctx.input.customerId,
      }),
      outputKey: 'fraudCheck',
      activityOptions: {
        timeout: 120000, // 2 minutes for thorough check
        heartbeatTimeout: 10000, // 10 seconds
        autoHeartbeat: false, // Manual heartbeat with progress
      },
    },

    // Step 3: Charge payment (branching - card vs wallet)
    {
      name: 'charge-payment',
      branches: [
        {
          when: ctx => ctx.input.paymentMethod === 'card',
          activity: getActivityToken(ChargeCardActivity),
          input: ctx => ({
            amount: ctx.input.amount,
            cardToken: ctx.input.cardToken!,
          }),
          compensation: {
            activity: getActivityToken(RefundCardActivity),
            input: ctx => ({
              transactionId: ctx.charge.transactionId,
              amount: ctx.charge.amount,
            }),
            activityOptions: {
              retryPolicy: { maxAttempts: 5 }, // Higher retry for refunds
            },
          },
          activityOptions: {
            timeout: 60000, // 1 minute for provider
            retryPolicy: {
              maxAttempts: 5,
              initialInterval: 5000,
            },
          },
        },
        {
          when: ctx => ctx.input.paymentMethod === 'wallet',
          activity: getActivityToken(ChargeWalletActivity),
          input: ctx => ({
            amount: ctx.input.amount,
            walletId: ctx.input.walletId!,
          }),
          compensation: {
            activity: getActivityToken(RefundWalletActivity),
            input: ctx => ({
              transactionId: ctx.charge.transactionId,
            }),
          },
        },
      ],
      outputKey: 'charge',
    },

    // Step 4: Update ledger (with compensation)
    {
      name: 'update-ledger',
      activity: getActivityToken(UpdateLedgerActivity),
      input: ctx => ({
        paymentId: ctx.validation.paymentId,
        transactionId: ctx.charge.transactionId,
        amount: ctx.charge.amount,
      }),
      outputKey: 'ledger',
      compensation: {
        activity: getActivityToken(ReverseLedgerActivity),
        input: ctx => ({ entryId: ctx.ledger.entryId }),
      },
    },

    // Step 5: Send receipt (optional - conditional)
    {
      name: 'send-receipt',
      activity: getActivityToken(SendReceiptActivity),
      when: ctx => ctx.input.sendReceipt === true && !!ctx.input.email,
      input: ctx => ({
        email: ctx.input.email!,
        paymentId: ctx.validation.paymentId,
        amount: ctx.charge.amount,
      }),
    },
  ],

  // Error handler - called AFTER all activity retries are exhausted
  onError: async (error, context, completedSteps) => {
    const workflowError = toWorkflowError(error);

    console.error('Payment workflow failed:', {
      type: workflowError.type,
      message: workflowError.message,
      step: workflowError.stepName,
      completedSteps: completedSteps.length,
    });

    // Compensate on cancellation or non-retriable errors
    if (
      workflowError.type === ErrorType.CANCELLED ||
      workflowError.type === ErrorType.NON_RETRIABLE
    ) {
      return completedSteps.length > 0 ? 'compensate' : 'fail';
    }

    // Default: compensate if we have completed steps, otherwise fail
    return completedSteps.length > 0 ? 'compensate' : 'fail';
  },

  // Extract final output
  output: ctx => ({
    paymentId: ctx.validation.paymentId,
    transactionId: ctx.charge.transactionId,
    amount: ctx.charge.amount,
    status: 'completed',
  }),
};
```

### Step 4: Use in Service

```typescript
// src/application/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { IDurableExecutionClient } from '@shared/durable-execution';
import { PaymentProcessWorkflow } from './workflows';

@Injectable()
export class PaymentService {
  constructor(
    private readonly workflowClient: IDurableExecutionClient,
  ) {}

  async processPayment(input: {
    amount: number;
    currency: string;
    customerId: string;
    paymentMethod: 'card' | 'wallet';
    cardToken?: string;
    walletId?: string;
    email?: string;
  }) {
    try {
      const result = await this.workflowClient.execute(PaymentProcessWorkflow, {
        input: {
          ...input,
          sendReceipt: !!input.email,
        },
        workflowId: `payment-${Date.now()}`,
      });

      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }
}
```

---

## Feature Guide

### 1. Conditional Steps

Execute steps only when conditions are met:

```typescript
{
  name: 'fraud-check',
  activity: Symbol('check-fraud'),
  when: ctx => ctx.input.amount > 1000, // Only for high amounts
  input: ctx => ({ amount: ctx.input.amount }),
}
```

**Use cases:**
- Optional notifications
- Compliance checks for high-value transactions
- Feature flags

### 2. Branching Logic

Execute different activities based on runtime data:

```typescript
{
  name: 'process-payment',
  branches: [
    {
      when: ctx => ctx.input.amount > 10000,
      activity: Symbol('high-value-payment'),
    },
    {
      when: ctx => ctx.input.amount > 1000,
      activity: Symbol('medium-value-payment'),
    },
    {
      when: ctx => true, // Default branch
      activity: Symbol('standard-payment'),
    },
  ],
}
```

**Rules:**
- Evaluates branches in order
- First matching condition wins
- Always add a default branch `when: ctx => true`

### 3. SAGA Compensation

Automatic rollback on failure:

```typescript
{
  name: 'charge-card',
  activity: Symbol('charge-card'),
  compensation: {
    activity: Symbol('refund-card'),
    input: ctx => ({
      transactionId: ctx.chargeResult.transactionId
    }),
    activityOptions: {
      retryPolicy: { maxAttempts: 5 }, // Retry compensation more
    },
  },
}
```

**Best practices:**
- Make compensations idempotent (can be called multiple times safely)
- Use higher retry counts for compensations (they're critical)
- Log compensation failures but continue chain (best-effort)
- Compensation receives **full context including completed step outputs**
- After compensation completes, workflow fails permanently (no retry loop)

### 4. Error Handling

The `onError` handler is called **only after all activity retry attempts are exhausted**. It decides how the workflow should respond to permanent failures.

```typescript
onError: async (error, context, completedSteps) => {
  const workflowError = toWorkflowError(error);

  // Option 1: Fail permanently
  if (workflowError.type === ErrorType.NON_RETRIABLE) {
    return 'fail';
  }

  // Option 2: Compensate (undo completed steps)
  if (completedSteps.length > 0) {
    return 'compensate';
  }

  // Option 3: Continue despite error (return partial result)
  if (isOptionalStep(error.stepName)) {
    return 'continue';
  }

  // Default: fail
  return 'fail';
}
```

**Supported Error Actions:**
- `'fail'` - Permanently fail the workflow (uses `ApplicationFailure.nonRetryable`)
- `'compensate'` - Execute SAGA compensation in reverse order (LIFO), then fail
- `'continue'` - Ignore error and continue to next step (returns partial output)
- ~~`'retry'`~~ - **Not supported** - Use activity `retryPolicy` instead

**Important: Activity Retry vs Workflow Retry**

❌ **Wrong:** Returning `'retry'` from `onError`
```typescript
onError: () => 'retry' // Don't do this - not standard
```

✅ **Correct:** Configure activity retry policy
```typescript
{
  name: 'validate',
  activity: VALIDATE_ACTIVITY,
  activityOptions: {
    retryPolicy: {
      maxAttempts: 5,        // Temporal retries automatically
      initialInterval: '1s',
      maximumInterval: '10s',
      backoffCoefficient: 2,
    },
  },
}
```

**Error Handler Execution Flow:**
```
1. Activity executes
   ↓ (fails)
2. Temporal retries activity (attempt 2)
   ↓ (fails)
3. Temporal retries activity (attempt 3)
   ↓ (fails)
   ...
N. All retry attempts exhausted (maxAttempts reached)
   ↓
✅ onError() is called ← YOU ARE HERE
   ↓
Decision: compensate | fail | continue
```

**Error types:**
- `RETRIABLE` - Network errors, timeouts (already handled by activity retry)
- `NON_RETRIABLE` - Validation errors, business rule violations
- `TIMEOUT` - Activity timeout (already retried if configured)
- `CANCELLED` - User cancellation
- `UNKNOWN` - Unclassified errors

### 5. Activity Options

Configure timeout and retry per step:

```typescript
{
  name: 'call-external-api',
  activity: Symbol('call-api'),
  activityOptions: {
    timeout: 60000, // 1 minute
    scheduleToStartTimeout: 5000, // Max queue time
    heartbeatTimeout: 10000, // Heartbeat every 10s
    retryPolicy: {
      maxAttempts: 5,
      initialInterval: 1000,
      maxInterval: 60000,
      backoffCoefficient: 2,
    },
  },
}
```

### 6. Heartbeat Support

For long-running activities:

```typescript
// Auto-heartbeat (default)
activityOptions: {
  heartbeatTimeout: 30000, // Activity must complete in 30s chunks
  // autoHeartbeat: true (default)
}

// Manual heartbeat (for progress reporting)
activityOptions: {
  heartbeatTimeout: 30000,
  autoHeartbeat: false,
}

async execute(input, context?: ActivityExecutionContext) {
  for (const item of items) {
    context?.heartbeat({ processed: item.id });
    await process(item);
  }
}
```

---

## Best Practices

### ✅ DO

1. **Use Centralized Activity Tokens (Token-First)**
   ```typescript
   // activity-tokens.ts (one file per domain)
   export const PAYMENT_TOKENS = {
     VALIDATE: Symbol('ValidatePayment'),
   } as const;

   // activity implementation
   @Activity(PAYMENT_TOKENS.VALIDATE)

   // workflow definition
   activity: PAYMENT_TOKENS.VALIDATE // ✅ No activity class import!
   ```

2. **Validate All I/O**
   ```typescript
   @ActivityValidation({ input: InputSchema, output: OutputSchema })
   ```

3. **Make Activities Idempotent**
   ```typescript
   // Check if already processed
   const existing = await this.repo.findByTransactionId(input.txId);
   if (existing) return existing;
   ```

4. **Add Compensation for State Changes**
   ```typescript
   compensation: {
     activity: Symbol('undo-action'),
     input: ctx => ({ id: ctx.result.id })
   }
   ```

5. **Use Descriptive Step Names**
   ```typescript
   name: 'charge-card-via-stripe'
   ```

6. **Set Appropriate Timeouts**
   ```typescript
   // Quick operations
   timeout: 5000

   // External API calls
   timeout: 60000

   // Long processing
   timeout: 300000, heartbeatTimeout: 30000
   ```

### ❌ DON'T

1. **Don't Import Activity Classes in Workflows**
   ```typescript
   // ❌ Bad - tight coupling
   import { ValidatePaymentActivity } from './activities';
   activity: getActivityToken(ValidatePaymentActivity)

   // ✅ Good - token-first approach
   import { PAYMENT_TOKENS } from './activity-tokens';
   activity: PAYMENT_TOKENS.VALIDATE

   // ❌ Worst - magic strings
   activity: 'validatePayment'
   ```

2. **Don't Skip Validation**
   ```typescript
   // Bad - no validation
   execute(input: any)

   // Good
   @ActivityValidation({ input: Schema, output: Schema })
   ```

3. **Don't Share State**
   ```typescript
   // Bad - shared state
   class MyActivity {
     private cache = new Map();
   }

   // Good - stateless
   class MyActivity {
     execute(input) { /* pure function */ }
   }
   ```

4. **Don't Forget Compensations**
   ```typescript
   // Bad - no compensation for state change
   { name: 'charge-card', activity: Symbol('charge') }

   // Good
   {
     name: 'charge-card',
     activity: Symbol('charge'),
     compensation: { activity: Symbol('refund') }
   }
   ```

---

## Common Patterns

### Pattern 1: Validate-Execute-Finalize

```typescript
steps: [
  { name: 'validate', activity: Symbol('validate') },
  { name: 'execute', activity: Symbol('execute'), compensation: {...} },
  { name: 'finalize', activity: Symbol('finalize') },
]
```

### Pattern 2: Multi-Provider Routing

```typescript
{
  name: 'execute-payment',
  branches: [
    { when: ctx => ctx.provider === 'stripe', activity: Symbol('stripe') },
    { when: ctx => ctx.provider === 'paypal', activity: Symbol('paypal') },
    { when: ctx => true, activity: Symbol('default-provider') },
  ],
}
```

### Pattern 3: Optimistic Locking with Compensation

```typescript
steps: [
  {
    name: 'reserve-inventory',
    activity: Symbol('reserve'),
    compensation: {
      activity: Symbol('release'),
      input: ctx => ({ reservationId: ctx.reserve.id })
    }
  },
  {
    name: 'process-payment',
    activity: Symbol('charge'),
    compensation: {
      activity: Symbol('refund'),
    }
  },
  { name: 'confirm-reservation', activity: Symbol('confirm') },
]
```

### Pattern 4: Async Notification

```typescript
{
  name: 'send-notification',
  activity: Symbol('notify'),
  when: ctx => ctx.input.notifyUser === true,
  activityOptions: {
    timeout: 10000,
    retryPolicy: { maxAttempts: 1 }, // Don't block on notification failure
  },
}
```

---

## Troubleshooting

### Issue: "Activity token not found"

**Cause**: Missing `@Activity` decorator

**Solution**:
```typescript
@Activity(Symbol('my-activity'))
export class MyActivity { }
```

### Issue: Validation fails silently

**Cause**: Schema doesn't match actual data

**Solution**: Check Zod schema definition
```typescript
const Schema = z.object({
  amount: z.number(), // Not z.string()!
});
```

### Issue: Compensation not running

**Cause**: No compensation defined or no steps completed

**Solution**:
```typescript
compensation: {
  activity: Symbol('undo'),
  input: ctx => ({ id: ctx.result.id })
}
```

### Issue: Activity timeout

**Cause**: Activity takes too long

**Solution**: Increase timeout or add heartbeat
```typescript
activityOptions: {
  timeout: 120000, // Increase timeout
  heartbeatTimeout: 30000, // Add heartbeat
}
```

---

## Advanced Topics

### Custom Error Mapping

Register domain-specific error mappings:

```typescript
// src/application/payment/errors/payment-error-mapper.ts
import { errorRegistry, ErrorType } from '@shared/durable-execution';
import { InsufficientFundsException, PaymentProviderTimeoutException } from './exceptions';

// Register custom error matchers
errorRegistry.register((error: Error) => {
  if (error instanceof InsufficientFundsException) {
    return ErrorType.NON_RETRIABLE;
  }
  if (error instanceof PaymentProviderTimeoutException) {
    return ErrorType.RETRIABLE;
  }
  return undefined;
});
```

### Dynamic Activity Options

Calculate options at runtime:

```typescript
{
  name: 'process-large-file',
  activity: Symbol('process'),
  activityOptions: {
    timeout: ctx => ctx.input.fileSize * 10, // Dynamic timeout
    retryPolicy: {
      maxAttempts: ctx => ctx.input.priority === 'high' ? 5 : 3,
    },
  },
}
```

---

## Migration Guide

### From String-based to Token-based Activities

**Before (Old - Magic Strings):**
```typescript
{ name: 'step1', activity: 'validatePayment' }
```

**After (Recommended - Token-First):**
```typescript
// 1. Create centralized tokens
// activity-tokens.ts
export const PAYMENT_TOKENS = {
  VALIDATE: Symbol('ValidatePayment'),
} as const;

// 2. Use token in activity
@Activity(PAYMENT_TOKENS.VALIDATE)
class ValidatePaymentActivity {}

// 3. Use token in workflow (no class import!)
import { PAYMENT_TOKENS } from './activity-tokens';
{ name: 'step1', activity: PAYMENT_TOKENS.VALIDATE }
```

**Alternative (Not Recommended - Tight Coupling):**
```typescript
// ⚠️ Acceptable but creates dependency between workflow and activity files
import { ValidatePaymentActivity } from './activities';
{ name: 'step1', activity: getActivityToken(ValidatePaymentActivity) }
```

### Adding Validation to Existing Activities

**Before:**
```typescript
class MyActivity {
  execute(input: any): any { }
}
```

**After:**
```typescript
const InputSchema = z.object({ /* ... */ });
const OutputSchema = z.object({ /* ... */ });

@ActivityValidation({ input: InputSchema, output: OutputSchema })
class MyActivity {
  execute(input: z.infer<typeof InputSchema>): Promise<z.infer<typeof OutputSchema>> { }
}
```

---

## FAQ

**Q: Can I use async/await in workflow definitions?**
A: No, workflow definitions are static. Use async in `onError` handler only.

**Q: How do I debug workflow execution?**
A: Use Temporal UI or add logging in activities. Workflow context is immutable.

**Q: Can I modify context in activities?**
A: No, activities return output that gets added to context via `outputKey`.

**Q: What happens if compensation fails?**
A: It's logged but doesn't block other compensations (best-effort).

**Q: Can I nest workflows?**
A: Yes, treat child workflows as activities in parent workflow.

**Q: Should I use centralized tokens or `getActivityToken()`?**
A: **Centralized tokens (recommended)**. This follows Temporal best practices by decoupling workflows from activity implementations. Use `getActivityToken()` only for backward compatibility or rapid prototyping.

**Q: How should I organize activity tokens?**
A: Create one token file per domain/bounded context:
```
src/application/
  payment/
    activity-tokens.ts  ← All payment tokens
    activities/
    workflows/
  wallet/
    activity-tokens.ts  ← All wallet tokens
    activities/
    workflows/
```

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Temporal Documentation](https://docs.temporal.io/) (if using Temporal)
- [SAGA Pattern](https://microservices.io/patterns/data/saga.html)

---

**Need help?** Check the inline documentation in interface files or reach out to the platform team.
