import { Injectable, Scope } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { IUnitOfWork } from '@/application/interfaces';
import { Nullable } from '@/shared/types';

@Injectable({ scope: Scope.REQUEST })
export class MongoUnitOfWork implements IUnitOfWork {
  private session: Nullable<ClientSession> = null;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction(): Promise<void> {
    this.session = await this.connection.startSession();
    this.session.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (this.session) {
      await this.session.commitTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  async rollbackTransaction(): Promise<void> {
    if (this.session) {
      await this.session.abortTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    await this.startTransaction();
    try {
      const result = await operation();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  // Native mongo utility if repositories need explicit session access 
  getSession(): Nullable<ClientSession> {
    return this.session;
  }
}
