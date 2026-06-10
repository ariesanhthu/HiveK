# Auth Domain Observations

While enhancing the test suite for the Auth domain, the following observations were made regarding the source code:

## 1. Hardcoded Default Values
- **`AuthSignUpCommandHandler`**: Uses hardcoded default phone `+84000000000` and name `DEFAULT NAME` if optional fields are missing.
- **`AuthGoogleSignInCommandHandler`**: Uses hardcoded default phone `+0000000000` and name `Google User`.
- *Recommendation*: These should ideally be configurable via `ConfigService` or defined as constants in a shared configuration file.

## 2. Silent Error Handling
- **`AuthSendOtpCommandHandler`**: Silently catches and ignores all errors from the `MailerService`. While intended to prevent blocking during development/testing, it might hide real SMTP configuration issues in production if not logged.
- **`AuthSignUpCommandHandler`**: Silently catches and ignores errors when dispatching the `AuthSendOtpCommand`.
- *Recommendation*: Log these errors even if they don't block the main flow.

## 3. Password Security
- **`AuthGoogleSignInCommandHandler`**: Sets `passwordHash` to an empty string for users created via Google Sign-In. 
- *Recommendation*: Ensure that other parts of the system (like standard Sign-In) correctly handle empty password hashes (e.g., by preventing standard login for Google-only accounts). (The current `AuthSignInCommandHandler` checks `comparePassword`, which should fail for an empty hash vs any password).

## 4. Enterprise Domain Observations
- **`EnterpriseCreateCommandHandler`**: If the user is not found or is not an `EnterpriseUserRoot`, the enterprise is still created but not associated with the user. This results in an orphaned enterprise profile.
- **`EnterpriseAddUserCommandHandler` & `EnterpriseRevokeUserCommandHandler`**: These handlers iterate over users and call `userRepository.save(user)` multiple times within a loop. While wrapped in `UnitOfWork`, it might be more efficient to perform batch updates if the repository supports it.
- **`EnterpriseAddUserCommandHandler`**: If a user in the list is already part of the enterprise, it still calls `save` and publishes a `UserAddedToEnterpriseEvent` (though `user.addEnterprise` should handle the state check). It might be better to filter out existing members first to avoid redundant events.
