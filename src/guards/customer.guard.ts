import { PrismaService } from "@app/prisma/prisma.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const user_id = req.session.get("data");
    if (!user_id) throw new UnauthorizedException("User not logged in");

    const user = await this.prisma.customer.findUnique({
      where: { id: user_id },
    });

    if (!user) throw new UnauthorizedException("Invalid user role");

    req["user"] = user;

    return true;
  }
}
