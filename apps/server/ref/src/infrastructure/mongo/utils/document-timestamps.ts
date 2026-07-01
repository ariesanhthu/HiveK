/** Đọc trường timestamp từ Mongoose document (timestamps hoặc tên field tùy schema). */
export function getDocDate(doc: { get(key: string): unknown }, key: string): Date {
	const v = doc.get(key);
	return v instanceof Date ? v : new Date();
}
