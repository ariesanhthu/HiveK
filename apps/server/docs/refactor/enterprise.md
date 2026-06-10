# [COMPLETED] Enterprise Domain Refactoring Plan & Best Practices

This document outlines the agreed-upon architectural improvements and refactoring steps for the Enterprise domain to address current performance and logical inefficiencies.

## 1. Batch Processing for User Associations
**Current Issue**: In `EnterpriseAddUserCommandHandler` and `EnterpriseRevokeUserCommandHandler`, the system iterates over multiple users, calling `userRepository.save(user)` individually within a loop. 
**Action Items**:
1.  **Transaction Safety**: Ensure these operations remain strictly wrapped within the `UnitOfWork` (UoW) to guarantee atomicity.
2.  **Bulk Operations**: Create new methods in the `IUserRepository` (e.g., `saveMany` or `bulkUpdateEnterpriseIds`) to handle bulk uploads/updates of members. This will significantly reduce database round-trips compared to individual save operations.

## 2. Preventing Redundant Event Emissions
**Current Issue**: `EnterpriseAddUserCommandHandler` currently calls `save` and publishes a `UserAddedToEnterpriseEvent` for every user in the input list, even if a user is already a member of the enterprise.
**Action Items**:
1.  **Pre-filtering**: Add a filtering step before the loop or bulk operation to identify which users are *actually* new additions to the enterprise.
2.  **Conditional Emission**: Only emit the `UserAddedToEnterpriseEvent` for users who successfully passed the filter (i.e., those who were not previously associated with the enterprise). This prevents spamming downstream services or notification handlers with duplicate events.

## 3. Handling Orphaned Profiles
**Current Issue**: `EnterpriseCreateCommandHandler` currently allows the creation of an `EnterpriseRoot` even if the initiating user is not found or is not of type `EnterpriseUserRoot`, leading to an orphaned profile.
**Action Items**:
1.  **Strict Validation**: Add a validation step *before* creating the enterprise entity to ensure the user exists and is a valid `EnterpriseUserRoot`. If the validation fails, throw an appropriate exception and halt creation.
