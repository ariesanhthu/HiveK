import { DomainException } from '../common/exceptions/domain.exception';

export class PackageNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Package not found with identifier: ${identifier}`);
  }
}

export class PackageCodeAlreadyExistsException extends DomainException {
  constructor(code: string) {
    super(`Package already exists with code: ${code}`);
  }
}

export class PackageDeactivationNotAllowedException extends DomainException {
  constructor(packageId?: string) {
    super(
      packageId
        ? `Deactivation not allowed for package ${packageId} because it is in use`
        : `Deactivation not allowed because it is in use`
    );
  }
}

export class PackageHasActiveVersionException extends DomainException {
  constructor(packageId: string) {
    super(`Package ${packageId} already has an active version`);
  }
}

export class PackageInUseException extends DomainException {
  constructor(packageId: string) {
    super(`Package ${packageId} is currently in use and cannot be modified or deleted`);
  }
}

export class PackageNoVariantsException extends DomainException {
  constructor(packageId: string) {
    super(`Package ${packageId} has no variants.`);
  }
}

export class DuplicateVariantException extends DomainException {
  constructor(detail: string) {
    super(`Duplicate variant found: ${detail}`);
  }
}

export class InvalidFeaturePermissionException extends DomainException {
  constructor(detail: string) {
    super(`Invalid feature permission: ${detail}`);
  }
}
