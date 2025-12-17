import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiEndpoint } from "./common/decorators/api-endpoint.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiEndpoint({
    summary: "Health check endpoint",
    success: {
      status: 200,
      type: String
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
