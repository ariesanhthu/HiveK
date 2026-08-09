import { env, envInt } from '@/shared/utils';

export const getRmqUri = (): string => {
  const protocol = env('RMQ_PROTOCOL', 'amqp');
  const RMQ_USER = env('RMQ_USER');
  const RMQ_PASSWORD = env('RMQ_PASSWORD');
  const RMQ_HOST = env('RMQ_HOST');
  const defaultPort = protocol === 'amqps' ? 5671 : 5672;
  const port = envInt('RMQ_PORT', defaultPort);

  const vhost = env('RMQ_VHOST', '/').replace(/^\//, '');
  const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';

  return `${protocol}://${encodeURIComponent(RMQ_USER)}:${encodeURIComponent(RMQ_PASSWORD)}@${RMQ_HOST}:${port}${vhostPart}`;
};
