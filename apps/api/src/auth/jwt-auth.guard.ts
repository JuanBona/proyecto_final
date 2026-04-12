import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = header.slice(7);

    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
      });

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
