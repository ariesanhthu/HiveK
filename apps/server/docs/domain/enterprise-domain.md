# Enterprise Domain

This document describes the business rules, entities, and workflows for the Enterprise domain within the HiveK server.

## 1. Core Concepts & Aggregates

The Enterprise domain manages Brand/Company identities and their associated staff/users.

### Enterprise Aggregate (`EnterpriseRoot`)
Represents a brand or company profile on the platform.
* **Owner**: Every enterprise is owned by a single user (`userId`).
* **Attributes**: Includes company name, contact details, description, website, and tax ID.
* **Verification**: Enterprises can be marked as verified (`is_verified`) by administrators to build trust.
* **Lifecycle**: Supports soft-deletion and hard-deletion (with cleanup of associated campaigns).

### Enterprise User Aggregate (`EnterpriseUserRoot`)
A specialized user aggregate that can belong to one or multiple enterprises.
* **Membership**: Stores a list of `enterprise_ids` the user is authorized to manage.
* **Roles**: Typically holds enterprise-specific permissions (Staff, Manager, etc.).

---

## 2. Workflows

### Enterprise Creation
1. **Prerequisite**: The requesting user must be of type `ENTERPRISE`.
2. **Conflict Check**: A user can currently only own one primary enterprise profile.
3. **Association**: Upon creation, the enterprise ID is automatically added to the owner's `enterprise_ids` list.

### Membership Management (Add/Revoke User)
1. **Authorization**: Only the enterprise owner can add or revoke other members.
2. **Validation**: Added users must be of type `ENTERPRISE`.
3. **Events**: 
    * `UserAddedToEnterpriseEvent`: Triggered when a member is added.
    * `UserRevokedFromEnterpriseEvent`: Triggered when a member is removed.
4. **Integration**: These events trigger integration emails (via Outbox) to notify the affected users.

### Profile Updates
* Owners can update company details (name, email, phone, etc.).
* Phone numbers are validated using the `PhoneNumberVO` format (starting with `+`).

### Deletion Lifecycle
* **Soft Delete**: Marks the enterprise as deleted but keeps data for audit/recovery.
* **Hard Delete**: 
    * **Constraint**: Cannot hard-delete an enterprise if it has active campaigns.
    * **Cleanup**: Automatically deletes all associated campaigns and emits an `EntityHardDeletedEvent`.
* **Restore**: Reverses a soft-delete, clearing the deletion timestamps.

---

## 3. Technical Implementation Details

### Architectural Patterns
* **CQRS**: Separates write operations (Commands like `EnterpriseCreateCommand`) from optimized read operations (Queries like `EnterpriseGetByIdQuery`).
* **Repository Pattern**: `IEnterpriseRepository` and `IUserRepository` (handling `EnterpriseUserRoot`) abstract the Mongoose persistence layer.
* **Unit of Work**: Ensures that adding a user to an enterprise and updating the user's membership list happen atomically.
* **Outbox Pattern**: Integration events (e.g., `NotifyEnterpriseInvitationEmail`) are persisted in the same transaction as the membership change, ensuring reliable notification delivery via RabbitMQ.

---

## 4. Key Invariants & Rules
* **Ownership**: Most operations (`Update`, `AddUser`, `Delete`) require the `requestedBy` ID to match the enterprise `userId`.
* **User Type Integrity**: Only `EnterpriseUserRoot` instances can be associated with an enterprise; `KOLUserRoot` or `AdminRoot` are restricted.
* **Campaign Guard**: Active campaigns are a hard blocker for deleting an enterprise to prevent data inconsistency in the advertising module.
