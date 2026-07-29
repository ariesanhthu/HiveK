import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { IRequestContext } from '@/application/interfaces/request-context.interface';

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<IRequestContext>();

  get(): IRequestContext | undefined {
    return this.storage.getStore();
  }

  async run<T>(ctx: IRequestContext, fn: () => Promise<T> | T): Promise<T> {
    return this.storage.run(ctx, fn);
  }
}
