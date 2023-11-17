import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";

@Controller({ path: "hello", version: VERSION_NEUTRAL })
export class AppController {
  @Get()
  async sayHello() {
    return "Hello World!";
  }
}
