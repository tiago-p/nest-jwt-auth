/*
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { ApiError } from 'src/errors/api-error';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
//import { UserEntity } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { Request } from 'express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates new user',
  })
  @ApiCreatedResponse({ description: 'User created.', type: UserDto })
  @ApiBadRequestResponse({
    description: 'The request object doesn`t match the expected one',
    type: ApiError,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error while creating user',
    type: ApiError,
  })
  async create(
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
    type: ApiError,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req: Request): Promise<UserDto> {
    console.log(req);
    const user = req['auth'] as UserPayloadDto;
    console.log(user);
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
    type: ApiError,
  })
  @ApiBadRequestResponse({
    description: 'The request object doesn`t match the expected one',
    type: ApiError,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error while creating user',
    type: ApiError,
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

  //@Param('id') id: number,
  //@UseGuards(AuthGuard())
  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<any> {
  //   await this.usersService.remove(id);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'User deleted successfully',
  //   };
  // }
}
*/
