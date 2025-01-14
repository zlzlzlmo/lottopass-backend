import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { FindAllResponse } from 'lottopass-shared';
import { RecordEntity } from './record.entity';
import { UserService } from 'src/user/user.service';

@Controller('record')
@UseGuards(JwtAuthGuard)
export class RecordController {
  constructor(
    private readonly recordsService: RecordService,
    private readonly userService: UserService
  ) {}

  @Post('/create')
  async create(
    @Request() req,
    @Body() createRecordDto: CreateRecordDto
  ): Promise<FindAllResponse<RecordEntity>> {
    const userId = req.user.id;

    try {
      const user = await this.userService.findAllById(userId);
      const { transactionId } = createRecordDto;

      const isTaken = await this.recordsService.findOne(user, transactionId);
      if (isTaken) {
        throw new BadRequestException(
          `이미 등록된 거래번호입니다. User ID: ${userId}, Transaction ID: ${transactionId}`
        );
      }

      const data = await this.recordsService.create(userId, createRecordDto);
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('Error creating record:', error);

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Get('/all')
  async findAll(
    @Request() req,
    @Query() query
  ): Promise<FindAllResponse<RecordEntity[]>> {
    const userId = req.user.id;
    const data = await this.recordsService.findAll(userId, query);
    return {
      status: 'success',
      data,
    };
  }

  //   @Get(':id')
  //   async findOne(@Request() req, @Param('id') id: string) {
  //     const userId = req.user.id;
  //     return this.recordsService.findOne(userId, id);
  //   }

  //   @Put(':id')
  //   async update(
  //     @Request() req,
  //     @Param('id') id: string,
  //     @Body() updateRecordDto: UpdateRecordDto
  //   ) {
  //     const userId = req.user.id;
  //     return this.recordsService.update(userId, id, updateRecordDto);
  //   }

  @Delete('/delete')
  async delete(@Body('id') id: string): Promise<FindAllResponse<boolean>> {
    const data = await this.recordsService.deleteRecord(id);
    return {
      status: 'success',
      data,
    };
  }
}
