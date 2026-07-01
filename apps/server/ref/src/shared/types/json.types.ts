/**
 * JSON-serializable value tree — dùng khi cần giá trị JSON cụ thể (parse, proto).
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Object key-value động (metadata, credential, webhook) — không dùng `any`.
 * Dùng `unknown` cho giá trị để khớp Zod (`z.record(z.string(), z.unknown())`) và an toàn khi mở rộng.
 */
export type JsonRecord = Record<string, unknown>;

/** Bộ lọc / truy vấn động (Mongo, audit, …). */
export type UnknownRecord = Record<string, unknown>;
