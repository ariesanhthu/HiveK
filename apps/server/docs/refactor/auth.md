# Auth Domain Refactoring Plan & Best Practices

This document outlines recommended architectural improvements for the Authentication domain, focusing on reliability, decoupling, and security.

## 1. Reliability: Implementing the Outbox Pattern & Domain Events

Currently, the `AuthSignUpCommandHandler` and `AuthSendOtpCommandHandler` handle secondary infrastructure concerns (like sending emails) synchronously or within the same process. This can lead to silent failures or performance bottlenecks.

### Recommended Pattern: Event-Driven Decoupling
1.  **Emit Domain Events**: Instead of executing `AuthSendOtpCommand` directly within the `AuthSignUpCommandHandler`, the handler should emit a `UserRegisteredEvent`.
2.  **Asynchronous Event Handlers**: A dedicated event handler should listen for `UserRegisteredEvent`.
3.  **RabbitMQ Integration (Outbox)**: Instead of the event handler calling the `MailerService` directly, it should publish a message to a RabbitMQ exchange. A background worker (consumer) will then process the email delivery.

### Benefits
- **Reliability**: If the SMTP server is down, RabbitMQ can retry the task automatically.
- **Performance**: The primary API response is not delayed by SMTP handshakes.
- **Separation of Concerns**: Core business logic remains isolated from infrastructure failures.

## 2. Infrastructure Errors: Logging vs. Silent Catching

**Observation**: Currently, `AuthSendOtpCommandHandler` silently catches errors from `MailerService` to avoid blocking the user flow.

**Best Practice**:
- **Always Log**: Even if a failure shouldn't block the user, it must be logged with enough context (email, OTP type, error stack) to allow for troubleshooting.
- **Retry Mechanism**: By using the Outbox pattern mentioned above, transient infrastructure errors (like SMTP timeouts) can be handled via retries rather than just being ignored.

## 3. Google Sign-In & Password Security

**Current Strategy**: For users created via Google Sign-In, the `passwordHash` is intentionally left empty.
- **Goal**: Prevent standard password-based sign-in for these accounts.
- **Requirement**: If a Google-linked user wishes to set a password later, they must go through the "Reset Password" flow to verify ownership and establish a new credential.

## 4. Future Considerations: Configuration Management

**Observation**: Default values for phone numbers and full names are currently hardcoded in Handlers.
- **Improvement**: Move these defaults to `ConfigService` or a centralized `Constants` file to make the system more flexible across different environments.
