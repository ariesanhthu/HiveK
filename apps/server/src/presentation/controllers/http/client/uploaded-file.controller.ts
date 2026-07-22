import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ETargetType } from '@/core/enums/target-type.enum';
import {
  UploadedFileCreateCommand,
  UploadedFileBulkCreateCommand,
  UploadedFileCreateInputDto,
} from '@/application/commands';
import {
  UploadedFileGetByIdQuery,
} from '@/application/queries';
import { UploadedFileDto } from '@/application/dtos';
import { JwtAuthGuard } from '@/presentation/middleware/guards';
import { FileUploadValidationPipe } from '@/presentation/middleware/pipes/file-upload-validation.pipe';
import { ApiOkResponseEnvelope } from '@/presentation/decorators';
import { isEmpty } from '@/shared/utils';

@ApiTags('CLIENT-upload')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'upload', 1))
export class UploadedFileClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get uploaded file by ID' })
  @ApiOkResponseEnvelope(UploadedFileDto)
  async findById(@Param('id') id: string): Promise<UploadedFileDto> {
    return this.queryBus.execute(new UploadedFileGetByIdQuery(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        title: {
          type: 'string',
          description: 'Optional file title',
        },
        targetType: {
          type: 'string',
          enum: Object.values(ETargetType),
          description: 'Domain target type (USER, KOL_PROFILE, PLATFORM, CAMPAIGN, ENTERPRISE)',
        },
        targetId: {
          type: 'string',
          description: 'Associated domain target ID',
        },
        targetField: {
          type: 'string',
          description: 'Associated target field/property key (e.g. logo, avatar, icon)',
        },
      },
      required: ['file', 'targetType', 'targetId', 'targetField'],
    },
  })
  @ApiOperation({ summary: 'Upload and create new file (Max 25MB, Images/Docs/PDF only)' })
  @ApiOkResponseEnvelope(UploadedFileDto)
  async create(
    @UploadedFile(new FileUploadValidationPipe()) file: Express.Multer.File,
    @Body() input: UploadedFileCreateInputDto,
  ): Promise<UploadedFileDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.commandBus.execute(
      new UploadedFileCreateCommand(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        input,
      ),
    );
  }

  @Post('bulk')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload (maximum 10)',
        },
        title: {
          type: 'string',
          description: 'Optional file title (applies to all files or serves as a base title)',
        },
        targetType: {
          type: 'string',
          enum: Object.values(ETargetType),
          description: 'Domain target type (USER, KOL_PROFILE, PLATFORM, CAMPAIGN, ENTERPRISE)',
        },
        targetId: {
          type: 'string',
          description: 'Associated domain target ID',
        },
        targetField: {
          type: 'string',
          description: 'Associated target field/property key (e.g. logo, avatar, icon)',
        },
      },
      required: ['files', 'targetType', 'targetId', 'targetField'],
    },
  })
  @ApiOperation({ summary: 'Upload and create multiple files (limit to 10, Max 25MB each)' })
  @ApiOkResponseEnvelope(UploadedFileDto)
  async createBulk(
    @UploadedFiles(new FileUploadValidationPipe()) files: Express.Multer.File[],
    @Body() input: UploadedFileCreateInputDto,
  ): Promise<UploadedFileDto[]> {
    if (isEmpty(files)) {
      throw new BadRequestException('At least one file is required');
    }
    return this.commandBus.execute(
      new UploadedFileBulkCreateCommand(
        files.map((file) => ({
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        })),
        input,
      ),
    );
  }
}

