import { PrismaService } from "@app/prisma/prisma.service";
import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from "@nestjs/terminus";

@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private config: ConfigService,
    private prisma: PrismaService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get("json")
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck("home-page", this.config.get("APP_URL") + "/hello"),
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.memory.checkHeap("heap-memory", 150 * 1024 * 1024),
    ]);
  }
}
