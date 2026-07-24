import { ERoleType } from '@/core/enums';
import { IS_PUBLIC_KEY, Public } from '@/presentation/decorators/public.decorator';
import { Roles, ROLES_KEY } from '@/presentation/decorators/roles.decorator';

describe('Decorators', () => {
  describe('@Public', () => {
    it('should set isPublic metadata to true', () => {
      class TestController {
        @Public()
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.testMethod);
      expect(metadata).toBe(true);
    });
  });

  describe('@Roles', () => {
    it('should set roles metadata', () => {
      class TestController {
        @Roles(ERoleType.ADMIN, ERoleType.KOL)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([ERoleType.ADMIN, ERoleType.KOL]);
    });

    it('should set single role metadata', () => {
      class TestController {
        @Roles(ERoleType.ENTERPRISE)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([ERoleType.ENTERPRISE]);
    });

    it('should set empty array when no roles provided', () => {
      class TestController {
        @Roles()
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestController.prototype.testMethod);
      expect(metadata).toEqual([]);
    });
  });
});
