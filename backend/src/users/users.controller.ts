import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody, ApiParam } from "@nestjs/swagger";
import {
  UserCreateDTO,
  UserUpdateDTO,
  UserGetDTO,
  UserDTO,
} from "@vigilart/shared/schemas";
import type { UserCreate, UserUpdate, UserGet } from "@vigilart/shared/types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint({
    summary: "Create a new user",
    success: {
      status: HttpStatus.CREATED,
      type: UserGetDTO,
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
    protected: true,
  })
  @ApiBody({ type: UserCreateDTO })
  async create(@Body() createUserDto: UserCreateDTO): Promise<UserGet> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiEndpoint({
    summary: "Retrieve all users",
    success: {
      status: HttpStatus.OK,
      type: [UserGetDTO],
    },
    errors: [],
    protected: true,
  })
  async findAll(): Promise<UserGet[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retrieve a user by ID",
    success: {
      status: HttpStatus.OK,
      type: UserDTO,
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserGet> {
    return this.usersService.findOneWithoutPassword(id);
  }

  @Get("email/:email")
  @ApiEndpoint({
    summary: "Retrieve a user by email",
    success: {
      status: HttpStatus.OK,
      type: UserDTO,
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "email", type: String })
  async findByEmail(@Param("email") email: string): Promise<UserGet> {
    return this.usersService.findByEmailWithoutPassword(email);
  }

  @Patch(":id")
  @ApiEndpoint({
    summary: "Update a user by ID",
    success: {
      status: HttpStatus.OK,
      type: UserGetDTO,
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UserUpdateDTO })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UserUpdateDTO
  ): Promise<UserGet> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiEndpoint({
    summary: "Delete a user by ID",
    success: {
      status: HttpStatus.NO_CONTENT,
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
