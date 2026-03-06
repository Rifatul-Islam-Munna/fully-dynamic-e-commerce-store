import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Brackets, Not, Repository } from 'typeorm';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteUserQueryDto } from './dto/delete-user-query.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { jwts } from '../../lib/auth.guard';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const email = signupDto.email.toLowerCase().trim();
    const phoneNumber = signupDto.phoneNumber?.trim() || null;

    const emailExists = await this.userRepository.findOne({
      where: { email },
    });
    this.logger.log(emailExists);

    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    if (phoneNumber) {
      const phoneExists = await this.userRepository.findOne({
        where: { phoneNumber },
      });

      if (phoneExists) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 12);

    const user = this.userRepository.create({
      firstName: signupDto.firstName.trim(),
      lastName: signupDto.lastName.trim(),
      email,
      phoneNumber,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    return this.buildAuthResponse(savedUser);
  }

  async login(loginDto: LoginDto) {
    const identity = loginDto.identity?.trim();
    const identityEmail = identity?.includes('@')
      ? identity.toLowerCase()
      : undefined;
    const identityPhone = identity && !identity.includes('@')
      ? identity
      : undefined;

    const email = identityEmail ?? loginDto.email?.toLowerCase().trim();
    const phoneNumber = identityPhone ?? loginDto.phoneNumber?.trim();

    if (!email && !phoneNumber) {
      throw new BadRequestException(
        'Provide identity or either email or phoneNumber',
      );
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash');

    if (email) {
      queryBuilder.where('LOWER(user.email) = LOWER(:email)', { email });
    } else {
      queryBuilder.where('user.phoneNumber = :phoneNumber', { phoneNumber });
    }

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('Account is not active');
    }

    user.lastLoginAt = new Date();
    const savedUser = await this.userRepository.save(user);

    return this.buildAuthResponse(savedUser);
  }

  async getMyProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPasswordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
    await this.userRepository.save(user);

    return {
      updated: true,
      message: 'Password updated successfully',
    };
  }

  async adminGetUsers(currentUser: jwts, query: AdminUserQueryDto) {
    this.ensureAdmin(currentUser);

    const { userId, email, phoneNumber } = query;

    if (userId || email || phoneNumber) {
      let singleUserWhere:
        | { id: string }
        | { email: string }
        | { phoneNumber: string };

      if (userId) {
        singleUserWhere = { id: userId };
      } else if (email) {
        singleUserWhere = { email: email.toLowerCase() };
      } else {
        singleUserWhere = { phoneNumber: phoneNumber as string };
      }

      const user = await this.userRepository.findOne({
        where: singleUserWhere,
      });

      if (!user) {
        throw new NotFoundException('User not found for provided query');
      }

      return {
        mode: 'single',
        data: user,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('user.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` })
            .orWhere('user.phoneNumber ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    qb.skip((page - 1) * limit).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      mode: 'list',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(currentUser: jwts, updateUserDto: UpdateUserDto) {
    const targetUserId = updateUserDto.userId;
    const currentUserId = currentUser.id;
    const isAdmin = this.isAdmin(currentUser);

    if (!isAdmin && targetUserId !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      const normalizedEmail = updateUserDto.email.toLowerCase().trim();
      const emailExists = await this.userRepository.exist({
        where: { email: normalizedEmail, id: Not(user.id) },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
      user.email = normalizedEmail;
    }

    if (updateUserDto.phoneNumber !== undefined) {
      const nextPhone = updateUserDto.phoneNumber?.trim() || null;
      if (nextPhone) {
        const phoneExists = await this.userRepository.exist({
          where: { phoneNumber: nextPhone, id: Not(user.id) },
        });
        if (phoneExists) {
          throw new ConflictException('Phone number already in use');
        }
      }
      user.phoneNumber = nextPhone;
    }

    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName.trim();
    }

    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName.trim();
    }

    if (updateUserDto.avatarUrl !== undefined) {
      user.avatarUrl = updateUserDto.avatarUrl?.trim() || null;
    }

    if (updateUserDto.defaultShippingAddress !== undefined) {
      user.defaultShippingAddress = updateUserDto.defaultShippingAddress ?? null;
    }

    if (updateUserDto.defaultBillingAddress !== undefined) {
      user.defaultBillingAddress = updateUserDto.defaultBillingAddress ?? null;
    }

    if (
      updateUserDto.role !== undefined ||
      updateUserDto.status !== undefined ||
      updateUserDto.isEmailVerified !== undefined ||
      updateUserDto.isPhoneVerified !== undefined
    ) {
      if (!isAdmin) {
        throw new ForbiddenException(
          'Only admin can update role/status/verification fields',
        );
      }

      if (updateUserDto.role !== undefined) {
        user.role = updateUserDto.role;
      }
      if (updateUserDto.status !== undefined) {
        user.status = updateUserDto.status;
      }
      if (updateUserDto.isEmailVerified !== undefined) {
        user.isEmailVerified = updateUserDto.isEmailVerified;
      }
      if (updateUserDto.isPhoneVerified !== undefined) {
        user.isPhoneVerified = updateUserDto.isPhoneVerified;
      }
    }

    const savedUser = await this.userRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async deleteUser(currentUser: jwts, query: DeleteUserQueryDto) {
    const targetUserId = query.userId ?? currentUser.id;
    const currentUserId = currentUser.id;
    const isAdmin = this.isAdmin(currentUser);

    if (!isAdmin && targetUserId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete({ id: targetUserId });

    return {
      deleted: true,
      userId: targetUserId,
    };
  }

  private ensureAdmin(currentUser: jwts) {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException('Only admin can access this endpoint');
    }
  }

  private isAdmin(currentUser: jwts) {
    const role = currentUser?.role?.toLowerCase();
    return role === 'admin' || role === 'super_admin';
  }

  private async buildAuthResponse(user: User) {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      mobileNumber: user.phoneNumber ?? '',
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('ACCESS_TOKEN'),
      expiresIn: '1d',
    });

    return {
      access_token: accessToken,
      accessToken,
      user: this.toSafeUser(user),
      message: 'Success',
    };
  }

  private toSafeUser(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user as User & {
      passwordHash?: string;
    };

    return safeUser;
  }
}
