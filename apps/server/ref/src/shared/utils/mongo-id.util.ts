import { Types } from 'mongoose';

/** Parse Mongo ObjectId-like or string values into an id string. */
export function idFromObjectIdLike(value: unknown): string | null {
	if (value == null) return null;
	if (typeof value === 'string') return value;
	if (value instanceof Types.ObjectId) return value.toString();
	return null;
}

/** String id from a Mongoose document (virtual `id` or `_id`). */
export function documentIdString(doc: { id?: unknown; _id?: unknown }): string | undefined {
	if (typeof doc.id === 'string' && doc.id.length > 0) return doc.id;
	return idFromObjectIdLike(doc._id) ?? undefined;
}
