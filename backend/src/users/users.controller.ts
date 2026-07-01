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
  Res
} from "@nestjs/common";
import type { Response } from "express";
import { UsersService } from "./users.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { clearAuthCookies } from "../common/utils/get-cookie-options";
import { ApiBody, ApiParam } from "@nestjs/swagger";
import {
  UserCreateDTO,
  UserUpdateDTO,
  UserGetDTO,
  UserDTO
} from "@vigilart/shared/schemas";
import type { UserGet } from "@vigilart/shared/types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint({
    summary: "Create a new user",
    success: {
      status: HttpStatus.CREATED,
      type: UserGetDTO
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
    protected: true
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
      type: [UserGetDTO]
    },
    protected: true
  })
  async findAll(): Promise<UserGet[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retrieve a user by ID",
    success: {
      status: HttpStatus.OK,
      type: UserDTO
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
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
      type: UserDTO
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
    ownerships: [{ data: "email", userField: "email", type: "params" }]
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
      type: UserGetDTO
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
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
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
    ownerships: [{ data: "id", userField: "id", type: "params" }]
  })
  @ApiParam({ name: "id", type: String })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    await this.usersService.remove(id);
    // Deleting the account cascade-removes the refresh token, so the guarded
    // /auth/logout route can no longer be used to clear the session. Clear the
    // auth cookies here so the client isn't left with a stale auth_token.
    clearAuthCookies(response);
  }
}
