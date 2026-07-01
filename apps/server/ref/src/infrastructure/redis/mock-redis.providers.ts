import { Logger } from '@nestjs/common';
import type { IRedisKeyService, IRedisStringService } from '@sgod-redis/library';

const logger = new Logger('RedisMock');

function createStore() {
	const values = new Map<string, string>();
	return {
		get(key: string) {
			return values.get(key) ?? null;
		},
		set(key: string, value: string) {
			values.set(key, value);
		},
		delete(...keys: string[]) {
			let n = 0;
			for (const k of keys) {
				if (values.delete(k)) n++;
			}
			return n;
		},
		has(key: string) {
			return values.has(key);
		},
	};
}

export function createMockRedisStringService(store = createStore()): IRedisStringService {
	return {
		async get(key: string) {
			logger.debug(`GET ${key}`);
			return store.get(key);
		},
		async set(key: string, value: string | number, options?: { ttl?: number }) {
			logger.debug(`SET ${key} ttl=${options?.ttl ?? 'none'}`);
			store.set(key, String(value));
		},
		async mget(keys: string[]) {
			return keys.map((key) => ({ key, value: store.get(key) }));
		},
		async incr() {
			return 0;
		},
		async incrby() {
			return 0;
		},
		async decr() {
			return 0;
		},
		async decrby() {
			return 0;
		},
		async mset() {
			return;
		},
		async append() {
			return 0;
		},
		async bitop() {
			return 0;
		},
		async bitpos() {
			return 0;
		},
		async getrange() {
			return '';
		},
		async setrange() {
			return 0;
		},
	};
}

export function createMockRedisKeyService(store = createStore()): IRedisKeyService {
	return {
		async del(...keys: string[]) {
			return store.delete(...keys);
		},
		async unlink(...keys: string[]) {
			return store.delete(...keys);
		},
		async exists(...keys: string[]) {
			return keys.filter((key) => store.has(key)).length;
		},
		async expire(key: string, _options: { seconds?: number }) {
			return store.has(key);
		},
		async expireAt() {
			return false;
		},
		async ttl(key: string) {
			return store.has(key) ? -1 : -2;
		},
		async pttl(key: string) {
			const ttl = await this.ttl(key);
			return ttl >= 0 ? ttl * 1000 : ttl;
		},
		async persist() {
			return false;
		},
		async rename() {
			return;
		},
		async renamenx() {
			return false;
		},
		async type() {
			return 'none';
		},
		async keys() {
			return [];
		},
		async scan() {
			return { cursor: '0', keys: [] };
		},
		async getInfo(key: string) {
			return {
				key,
				type: 'string',
				ttl: await this.ttl(key),
				encoding: 'string',
				size: 0,
			};
		},
	};
}
