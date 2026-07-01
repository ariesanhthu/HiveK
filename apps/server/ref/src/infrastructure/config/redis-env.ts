/** Đọc cờ bật Redis — mặc định true; set REDIS_ENABLED=false để dùng mock in-memory. */
export function isRedisEnabled(): boolean {
	const raw = process.env.REDIS_ENABLED?.trim().toLowerCase();
	if (raw === undefined || raw === '') {
		return true;
	}
	if (['true', '1', 'yes', 'y', 'on'].includes(raw)) {
		return true;
	}
	if (['false', '0', 'no', 'n', 'off'].includes(raw)) {
		return false;
	}
	return true;
}
