import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../lib/auth.guard';
import { RolesGuard } from '../../lib/roles.guard';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CheckoutService } from './checkout.service';

describe('CouponController', () => {
  let controller: CouponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: {},
        },
        {
          provide: CheckoutService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<CouponController>(CouponController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
