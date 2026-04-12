import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_SECRETS, AuthSecrets } from './auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(AUTH_SECRETS) private readonly authSecrets: AuthSecrets,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = header.slice(7);

    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: this.authSecrets.accessTokenSecret,
      });

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
