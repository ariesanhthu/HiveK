import * as crypto from 'crypto';

export function hashSHA256(data: string, secretKey: string): string {
	const hash = crypto.createHmac('sha256', secretKey);
	hash.update(data);
	return hash.digest('hex');
}

export function hashSHA512(data: string, secretKey: string): string {
	const hash = crypto.createHmac('sha512', secretKey);
	hash.update(data);
	return hash.digest('hex');
}

export function generateUUID(): string {
	return crypto.randomUUID();
}
