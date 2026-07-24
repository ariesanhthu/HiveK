# HiveK Project Guidelines & Coding Standards

Hướng dẫn chuẩn hóa comment, cấu trúc mã nguồn và quản lý cấu hình cho dự án **HiveK**.
Dự án áp dụng quy chuẩn phân đoạn comment theo chuẩn của extension [comment-divider](https://github.com/stackbreak/comment-divider) với độ dài chuẩn **80 kí tự** (`"comment-divider.length": 80`).

> [!IMPORTANT]
> **QUY TẮC NGÔN NGỮ COMMENT**:
> Tất cả các comment trong mã nguồn (JSDoc, Inline comments, Section Dividers) **BẮT BUỘC PHẢI DÙNG TIẾNG ANH** (English only). Không sử dụng tiếng Việt trong bất kỳ comment code nào.

---

## 1. Quy chuẩn Comment & Phân đoạn Mã nguồn (Comment Divider Standards)

Tất cả các đường phân cách comment trong dự án đều tuân thủ **độ dài chuẩn 80 ký tự** (`length: 80`) và **viết bằng Tiếng Anh**:

### A. Main Header (Phân đoạn chính / Block Header lớn)

Sử dụng cho các khối chức năng lớn nhất trong file (ví dụ: các phân đoạn chính của `@Module`, chia khối các phương thức trong Class lớn, hoặc nhóm API chính).

- **Kiểu C/C++ style (`/* ... */`)**:

```typescript
/* -------------------------------------------------------------------------- */
/*                  1. CORE & FRAMEWORK CONFIGURATION MODULES                 */
/* -------------------------------------------------------------------------- */
```

- **Kiểu Line comment style (`// ...`)**:

```typescript
// ============================================================================
// 1. CORE & FRAMEWORK CONFIGURATION MODULES
// ============================================================================
```

### B. Sub Header (Phân đoạn con / Subheader)

Sử dụng bên trong một Main Header để chia nhỏ các nhóm chức năng phụ hoặc các thành phần chi tiết hơn.

- **Kiểu C/C++ style (`/* ... */`)**:

```typescript
/* ------------------------ Global Pipes & Filters ------------------------ */
```

- **Kiểu Line comment style (`// ...`)**:

```typescript
// ----------------------------------------------------------------------------
// Global Pipes, Filters & Interceptors
// ----------------------------------------------------------------------------
```

### C. Solid Line (Dòng phân cách đơn)

Sử dụng để tạo đường kẻ mỏng phân tách giữa các hàm hoặc các đoạn logic ngắn (độ dài 80 ký tự).

```typescript
// ----------------------------------------------------------------------------
```

### D. JSDoc Comments (Mô tả Class, Method, DTO, Interface)

Tất cả các Class, Service, DTO, Interface hoặc Helper Method quan trọng đều **phải** được mô tả bằng JSDoc bằng **Tiếng Anh**.

```typescript
/**
 * Authentication and OAuth configuration service.
 * Automatically validates environment variables via AuthConfigDto.
 */
@Injectable()
export class AuthConfig extends BaseConfigService<AuthConfigDto> {
  /**
   * Get JWT Access Token expiration time in minutes.
   * @returns Expiration time in minutes
   */
  getJwtAccessExpirationMinutes(): number {
    return this.config.jwtAccessExpirationMinutes;
  }
}
```

---

## 2. Quy chuẩn Quản lý Cấu hình (NestJS Config Standard)

1. **Đưa các biến môi trường nhạy cảm vào `.env`**:
   - Tất cả các biến động hoặc chứa thông tin bảo mật (`MONGODB_URI`, `JWT_SECRET`, `SMTP_PASS`, `REDIS_PASSWORD`) được validate thông qua `Dto` class kế thừa `BaseConfigService` từ `@hivek/nest-core`.
2. **Hằng số tĩnh sử dụng `private static readonly`**:
   - Các giá trị tĩnh không nhạy cảm (Swagger title, version, route prefix mặc định) được khai báo dưới dạng `private static readonly` và trả về trực tiếp từ getter method.
3. **Nạp cấu hình tập trung 1 lần duy nhất**:
   - Khai báo mảng `globalConfigs` tại `apps/server/src/configs/index.ts`.
   - Nạp toàn bộ qua `ConfigModule.forRoot({ isGlobal: true, load: globalConfigs })` tại `AppModule`.
