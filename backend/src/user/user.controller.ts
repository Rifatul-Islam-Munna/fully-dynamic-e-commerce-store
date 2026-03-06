import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiQuery,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, type ExpressRequest } from '../../lib/auth.guard';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteUserQueryDto } from './dto/delete-user-query.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Signup',
    description:
      'Creates a new user account with bcrypt-hashed password, then returns access token and user info directly.',
  })
  @ApiResponse({
    status: 201,
    description: 'Signup success. Returns { accessToken, user }.',
  })
  signup(@Body() signupDto: SignupDto) {
    return this.userService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Logs in by unified `identity` (email or phoneNumber) + password. Also supports legacy `email` or `phoneNumber` fields.',
  })
  @ApiOkResponse({
    description: 'Login success. Returns { access_token, accessToken, user }.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token from login',
    required: true,
  })
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns profile info for the currently logged-in user from the JWT access token.',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    type: User,
  })
  getMyProfile(@Req() req: ExpressRequest) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.userService.getMyProfile(req.user.id);
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token from login',
    required: true,
  })
  @ApiOperation({
    summary: 'Change current user password',
    description:
      'Lets the authenticated user change their account password by sending the current password and a new password.',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
  })
  changeMyPassword(
    @Req() req: ExpressRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('admin')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'access_token',
    description: 'JWT access token from login',
    required: true,
  })
  @ApiOperation({
    summary: 'Admin user query endpoint (single route)',
    description:
      'Smart endpoint for admin. If `userId` or `email` or `phoneNumber` is provided, it returns one user (`mode: single`). If none are provided, it returns paginated users (`mode: list`) with optional text search.',
  })
  @ApiOkResponse({
    description: 'Single-user or paginated user list based on query',
  })
  getAdminUsers(
    @Req() req: ExpressRequest,
    @Query() query: AdminUserQueryDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.userService.adminGetUsers(req.user, query);
  }

  @Patch()
  @UseGuards(AuthGuard)
  
  @ApiOperation({
    summary: 'Update user (id from body)',
    description:
      'Updates a user by taking `userId` from request body (no route params). Non-admin can update only their own profile.',
  })
  @ApiOkResponse({
    description: 'Updated user',
    type: User,
  })
  updateUser(@Req() req: ExpressRequest, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.userService.updateUser(req.user, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)

  @ApiOperation({
    summary: 'Delete user (query only)',
    description:
      'Deletes user via query `userId` (no route params). If `userId` is omitted, it deletes the currently authenticated user.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Target user id to delete',
    example: '35f79af8-4d1f-4af6-a1ad-58446025c264',
  })
  @ApiOkResponse({
    description: 'Delete result',
  })
  deleteUser(@Req() req: ExpressRequest, @Query() query: DeleteUserQueryDto) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.userService.deleteUser(req.user, query);
  }
}
