import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Req
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import {
  DeviceTokenDTO,
  RegisterDeviceDTO,
  type DeviceToken
} from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiParam } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/auth";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService
  ) {}

  @Post("devices")
  @ApiEndpoint({
    summary: "Register a device token for push notifications",
    success: {
      status: HttpStatus.CREATED,
      type: DeviceTokenDTO
    },
    protected: true,
    errors: [HttpStatus.BAD_REQUEST]
  })
  async registerDevice(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RegisterDeviceDTO
  ): Promise<DeviceToken> {
    return this.notificationsService.registerDevice(req.user.id, dto);
  }

  @Delete("devices/:token")
  @ApiEndpoint({
    summary: "Unregister a device token",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    protected: true,
    errors: []
  })
  @ApiParam({
    name: "token",
    type: String,
    description: "The FCM device token to remove"
  })
  async unregisterDevice(
    @Req() req: AuthenticatedRequest,
    @Param("token") token: string
  ): Promise<void> {
    await this.notificationsService.unregisterDevice(req.user.id, token);
  }
}
