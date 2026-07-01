import type { IRepositoryFindManyOptions } from '@sgod-mongodb/library/core';
import type { ClientSession, Document, Model } from 'mongoose';

export function findManyOptions(
	session?: ClientSession,
	extra?: Pick<IRepositoryFindManyOptions, 'limit'>
): IRepositoryFindManyOptions | undefined {
	if (session === undefined && extra?.limit === undefined) {
		return undefined;
	}
	return {
		...(extra ?? {}),
		...(session !== undefined ? { session } : {}),
	};
}

/** Bridge `Model<TDoc>` khi `_id` là string (Mongoose 9 + lib `Document<ObjectId>` variance). */
export function asSgodModel<T>(model: Model<T>): Model<Document> {
	return model as unknown as Model<Document>;
}

/** Map doc từ lib core (`Document<ObjectId>`) → schema Nest (`_id: string`, …). */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- variance bridge lib Document → Nest schema doc
export function asMongooseDoc<TDoc>(doc: Document): TDoc {
	return doc as unknown as TDoc;
}
