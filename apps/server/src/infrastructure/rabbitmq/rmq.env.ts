import { env, envInt } from '@/shared/utils';

export const getRmqUri = (): string => {
  const RMQ_USER = env('RMQ_USER');
  const RMQ_PASSWORD = env('RMQ_PASSWORD');
  const RMQ_HOST = env('RMQ_HOST');
  const port = envInt('RMQ_PORT', 5672);

  const vhost = env('RMQ_VHOST', '/').replace(/^\//, '');
  const vhostPart = vhost ? `/${encodeURIComponent(vhost)}` : '';

  return `amqps://${encodeURIComponent(RMQ_USER)}:${encodeURIComponent(RMQ_PASSWORD)}@${RMQ_HOST}:${port}${vhostPart}`;
};