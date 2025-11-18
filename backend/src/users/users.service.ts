import { Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { randomUUID } from "crypto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma.service";
import { User } from "../generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const userData = {
      id: randomUUID(),
      email,
      password,
    };

    this.logger.log(`Creating new user ${email}`);
    return await this.prisma.user.create({
      data: userData,
    });
  }

  async findAll(): Promise<User[]> {
    this.logger.log("Finding all users");
    return await this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    this.logger.log(`Finding user ${id}`);
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user with ${email}`);
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user ${id}`);
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: string): Promise<User> {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
