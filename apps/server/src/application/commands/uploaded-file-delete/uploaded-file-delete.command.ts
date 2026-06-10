import { Command } from '@nestjs/cqrs';

export class UploadedFileDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
