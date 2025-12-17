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
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody, ApiParam } from "@nestjs/swagger";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint({
    summary: "Create a new user",
    success: {
      status: HttpStatus.CREATED
    },
    errors: [HttpStatus.CONFLICT],
    protected: true,
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiEndpoint({
    summary: "Retrieve all users",
    success: {
      status: HttpStatus.OK,
      type: [Object]
    },
    errors: [],
    protected: true,
  })
  async findAll() {
    return {
      users: await this.usersService.findAll(),
    };
  }

  @Get(":id")
  @ApiEndpoint({
    summary: "Retrieve a user by ID",
    success: {
      status: HttpStatus.OK,
    },
    errors: [HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  async findOne(@Param("id") id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiEndpoint({
    summary: "Update a user by ID",
    success: {
      status: HttpStatus.OK,
    },
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    protected: true,
  })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
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
  async remove(@Param("id") id: string) {
    return await this.usersService.remove(id);
  }
}
