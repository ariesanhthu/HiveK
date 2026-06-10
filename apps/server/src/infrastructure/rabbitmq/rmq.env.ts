export const getRmqUri = (): string => {
  const {
    RMQ_USER,
    RMQ_PASSWORD,
    RMQ_HOST,
    RMQ_PORT,
    RMQ_VHOST,
  } = process.env;

  if (!RMQ_USER || !RMQ_PASSWORD || !RMQ_HOST) {
    throw new Error('Missing required RabbitMQ env vars (RMQ_USER, RMQ_PASSWORD, RMQ_HOST)');
  }

  const portPart = RMQ_PORT ? `:${RMQ_PORT}` : '';
  const vhostPart = RMQ_VHOST ? `/${encodeURIComponent(RMQ_VHOST)}` : '';

  return `amqps://${encodeURIComponent(RMQ_USER)}:${encodeURIComponent(RMQ_PASSWORD)}@${RMQ_HOST}${portPart}${vhostPart}`;
};