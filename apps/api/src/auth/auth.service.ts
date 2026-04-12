import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_SECRETS, AuthSecrets } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(AUTH_SECRETS) private readonly authSecrets: AuthSecrets,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        { secret: this.authSecrets.refreshTokenSecret },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokens(id: string, email: string, role: string) {
    const payload = { sub: id, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authSecrets.accessTokenSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.authSecrets.refreshTokenSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
