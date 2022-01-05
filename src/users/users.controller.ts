import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
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
    userInfo: UserCreateDto,
  ): Promise<UserDto> {
    const userEntity = await this.usersService.create(userInfo);
    return UserDto.toView(userEntity);
  }

  @Get('me')
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
    @User() user: UserDto,
    @Body(new ValidationPipe()) data: UserUpdateDto,
  ): Promise<UserDto> {
    const userEntity = await this.usersService.update(user.id, data);
    return UserDto.toView(userEntity);
  }
}
