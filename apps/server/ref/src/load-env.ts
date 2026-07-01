import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env') });

if (process.env.KAFKA_BOOTSTRAP_SERVERS && !process.env.KAFKA_BROKERS) {
	process.env.KAFKA_BROKERS = process.env.KAFKA_BOOTSTRAP_SERVERS;
}
if (process.env.KAFKA_SSL_CA && !process.env.KAFKA_SSL_CA_LOCATION) {
	process.env.KAFKA_SSL_CA_LOCATION = process.env.KAFKA_SSL_CA;
}
