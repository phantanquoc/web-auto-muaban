import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException({ code: 'EMAIL_EXISTS', message: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hash } });
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, characterName: user.characterName } };
  }

  async createLinkCode(userId: string) {
    const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let c = '';
    for (let i = 0; i < 6; i++) c += alphanum[crypto.randomInt(alphanum.length)];
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // invalidate previous unconsumed codes for user
    await this.prisma.linkCode.updateMany({ where: { userId, consumed: false }, data: { consumed: true } });
    const lc = await this.prisma.linkCode.create({ data: { code: c, userId, expiresAt } });
    return { code: lc.code, expiresAt: lc.expiresAt };
  }

  async verifyLink(characterName: string, code: string) {
    const lc = await this.prisma.linkCode.findUnique({ where: { code } });
    if (!lc || lc.consumed || lc.expiresAt < new Date()) {
      throw new BadRequestException({ code: 'INVALID_LINK_CODE', message: 'Invalid or expired code' });
    }
    // check character already linked to another user
    const existing = await this.prisma.user.findFirst({ where: { characterName } });
    if (existing && existing.id !== lc.userId) {
      throw new ConflictException({ code: 'CHARACTER_ALREADY_LINKED', message: 'Character already linked' });
    }
    await this.prisma.$transaction([
      this.prisma.linkCode.update({ where: { id: lc.id }, data: { consumed: true } }),
      this.prisma.user.update({ where: { id: lc.userId }, data: { characterName } }),
    ]);
    const user = await this.prisma.user.findUnique({ where: { id: lc.userId } });
    return { characterName: user!.characterName };
  }
}
