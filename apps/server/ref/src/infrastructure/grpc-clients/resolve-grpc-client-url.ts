/**
 * Chuẩn hoá URL peer cho gRPC **client**.
 * `0.0.0.0` chỉ hợp lệ khi bind server — client phải dùng loopback hoặc host thật.
 */
export function resolveGrpcClientUrl(url: string | undefined, fallback = '127.0.0.1:50100'): string {
	const raw = (url ?? fallback).trim();
	if (!raw) return fallback;
	if (raw.startsWith('0.0.0.0:')) {
		return raw.replace('0.0.0.0', '127.0.0.1');
	}
	return raw;
}
