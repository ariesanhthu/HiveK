/** Re-export từ `@sgod-kafka/library` — tránh duplicate parse logic giữa service. */
export {
	tryParseKafkaEnvelope,
	resolveKafkaPayload,
	type ParseEnvelopeOptions,
} from '@sgod-kafka/library/factory';
export type {
	ParsedSgodKafkaEnvelope as KafkaParsedEnvelope,
	SgodKafkaEnvelopeStyle as KafkaEnvelopeStyle,
} from '@sgod-kafka/library/core';
