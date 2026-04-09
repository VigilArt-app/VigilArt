import { Controller, Get, HttpStatus } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiEndpoint } from "./common/decorators/api-endpoint.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiEndpoint({
    summary: "Health check endpoint",
    success: {
      status: HttpStatus.NO_CONTENT
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
