import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { Request } from 'express';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { User } from './../users/user.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  @ApiBadRequestResponse({
    description: 'The request object doesn`t match the expected one',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error while creating user',
  })
  async register(
    @Body(new ValidationPipe())
    data: UserCreateDto,
  ): Promise<UserDto> {
    const userEntity = await this.usersService.create(data);
    return UserDto.toView(userEntity);
  }

  @Get('me')
  @ApiOkResponse({ description: 'User informations', type: UserDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findOne(@User() user: UserDto): Promise<UserDto> {
    const userEntity = await this.usersService.findOneById(user.id);
    return UserDto.toView(userEntity);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Updates current user',
  })
  @ApiCreatedResponse({ description: 'User updated.', type: UserDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'The request object doesn`t match the expected one',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error while creating user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Body(new ValidationPipe()) data: UserUpdateDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const user = req['auth'] as UserPayloadDto;
    const userEntity = await this.usersService.update(user.id, data);
    return UserDto.toView(userEntity);
  }
}
