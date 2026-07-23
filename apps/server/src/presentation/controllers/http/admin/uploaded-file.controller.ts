import {
  UploadedFileBulkCreateCommand,
  UploadedFileCreateCommand,
  UploadedFileCreateInputDto,
  UploadedFileRestoreCommand,
} from '@/application/commands';
import { UploadedFileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  UploadedFileFilterDto,
  UploadedFileGetByIdQuery,
  UploadedFileGetListQuery,
} from '@/application/queries';
import { ERoleType } from '@/core/enums/role-type.enum';
import { TargetType } from '@/core/enums/target-type.enum';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { FileUploadValidationPipe } from '@/presentation/middleware/pipes/file-upload-validation.pipe';
import { isEmpty } from '@/shared/utils';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('ADMIN-upload')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'upload', 1))
export class UploadedFileAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all uploaded files' })
  async findAll(
    @Query() filters: UploadedFileFilterDto,
  ): Promise<PaginatedResponseDto<UploadedFileDto>> {
    return this.queryBus.execute(new UploadedFileGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get uploaded file by ID' })
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
          enum: Object.values(TargetType),
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
          enum: Object.values(TargetType),
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
  async createBulk(
    @UploadedFiles(new FileUploadValidationPipe()) files: Express.Multer.File[],
    @Body() input: UploadedFileCreateInputDto,
  ): Promise<UploadedFileDto[]> {
    if (isEmpty(files)) {
      throw new BadRequestException('At least one file is required');
    }
    if (files.length > 10) {
      throw new BadRequestException('Cannot upload more than 10 files at a time');
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

  /*
  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete uploaded file' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UploadedFileSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete uploaded file' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new UploadedFileDeleteCommand(id));
  }
  */

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted uploaded file' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new UploadedFileRestoreCommand(id));
  }
}
