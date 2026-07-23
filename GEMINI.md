# HiveK Project Guidelines & Coding Standards

Hướng dẫn chuẩn hóa comment, cấu trúc mã nguồn và quản lý cấu hình cho dự án **HiveK**.

---

## 1. Quy chuẩn Comment & Phân đoạn Mã nguồn

Để mã nguồn luôn sạch sẻ, dễ đọc và nhất quán giữa các thành viên, dự án áp dụng 3 cấp độ comment sau:

### A. Main Header (Phân đoạn chính / Khu vực lớn)

Sử dụng cho các khối chức năng lớn nhất trong file (ví dụ: các phân đoạn chính của `@Module`, chia khối các phương thức trong Class lớn, hoặc nhóm API trong Controller).

```typescript
// ============================================================================
// 1. CORE & FRAMEWORK CONFIGURATION MODULES
// ============================================================================
```

### B. Sub Header (Phân đoạn nhỏ / Nhóm con)

Sử dụng bên trong một Main Header để chia nhỏ các nhóm chức năng phụ hoặc chi tiết hơn.

```typescript
// ----------------------------------------------------------------------------
// Global Pipes, Filters & Interceptors
// ----------------------------------------------------------------------------
```

### C. JSDoc Comments (Mô tả Class, Method, DTO, Interface)

Tất cả các Class, Service, DTO, Interface hoặc Helper Method quan trọng đều **phải** được mô tả bằng JSDoc để hỗ trợ gợi ý code (IntelliSense) và tạo tự động API docs.

```typescript
/**
 * Service quản lý các thông số cấu hình Authentication & OAuth.
 * Tự động validate các biến môi trường thông qua AuthConfigDto.
 */
@Injectable()
export class AuthConfig extends BaseConfigService<AuthConfigDto> {
  /**
   * Lấy JWT Access Token Expiration Time (tính bằng phút).
   * @returns Số phút hết hạn của access token
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
