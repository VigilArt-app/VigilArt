import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody, ApiParam } from "@nestjs/swagger";
import { UserCreate, UserUpdate, UserGet, User } from "@vigilart/shared/schemas";
import type { UserCreateDto, UserUpdateDto, UserGetDto, UserDto } from "@vigilart/shared/types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint({
    summary: "Create a new user",
    success: {
      status: HttpStatus.CREATED,
      type: UserGet
    },
    errors: [HttpStatus.CONFLICT],
    protected: true,
  })
  @ApiBody({ type: UserCreate })
  async create(@Body() createUserDto: UserCreateDto): Promise<UserGetDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiEndpoint({
    summary: "Retrieve all users",
    success: {
      status: HttpStatus.OK,
      type: [UserGet]
    },
    errors: [],
    protected: true,
  })
  async findAll(): Promise<UserGetDto[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retrieve a user by ID",
    success: {
      status: HttpStatus.OK,
      type: User
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async findOne(@Param("id") id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Get("email/:email")
  @ApiEndpoint({
    summary: "Retrieve a user by email",
    success: {
      status: HttpStatus.OK,
      type: User
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "email", type: String })
  async findByEmail(@Param("email") email: string): Promise<UserDto> {
    return this.usersService.findByEmail(email);
  }

  @Patch(":id")
  @ApiEndpoint({
    summary: "Update a user by ID",
    success: {
      status: HttpStatus.OK,
      type: UserGet
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UserUpdate })
  async update(@Param("id") id: string, @Body() updateUserDto: UserUpdateDto): Promise<UserGetDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiEndpoint({
    summary: "Delete a user by ID",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async remove(@Param("id") id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
