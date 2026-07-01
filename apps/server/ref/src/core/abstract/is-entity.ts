export function isEntity(v: unknown): v is { _id: string } {
	return typeof v === 'object' && v !== null && '_id' in v;
}
