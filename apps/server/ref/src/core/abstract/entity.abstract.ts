import * as crypto from 'crypto';
import { isEntity } from './is-entity';

let counterIndex = crypto.randomBytes(3).readUIntBE(0, 3);

function generateObjectId(): string {
	const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
	const randomValue = crypto.randomBytes(5).toString('hex');
	counterIndex = (counterIndex + 1) % 0xffffff;
	const counter = counterIndex.toString(16).padStart(6, '0');
	return timestamp + randomValue + counter;
}

export abstract class Entity<T> {
	protected readonly _id: string;
	protected readonly props: T;

	constructor(props: T, id?: string) {
		this._id = id ? id : generateObjectId();
		this.props = props;
	}

	get id(): string {
		return this._id;
	}

	public equals(object?: Entity<T>): boolean {
		if (object == null || object == undefined) {
			return false;
		}

		if (this === object) {
			return true;
		}

		if (!isEntity(object)) {
			return false;
		}

		return this._id === object._id;
	}

	public toJSON(): Record<string, unknown> {
		return {
			id: this._id,
			...this.props,
		};
	}

	public getProps(): T {
		return this.props;
	}
}
