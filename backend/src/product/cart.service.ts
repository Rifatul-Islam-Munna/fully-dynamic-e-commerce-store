import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { jwts } from '../../lib/auth.guard';
import { CartQueryDto } from './dto/cart-query.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { DeleteCartItemQueryDto } from './dto/delete-cart-item-query.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  async create(currentUser: jwts, createCartItemDto: CreateCartItemDto) {
    const quantity = createCartItemDto.quantity ?? 1;

    const product = await this.productRepository.findOne({
      where: {
        id: createCartItemDto.productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    let unitPrice = product.price;
    let unitDiscountPrice = product.discountPrice;
    let productVariantId: string | null = null;

    if (product.hasVariants) {
      if (!createCartItemDto.productVariantId) {
        throw new BadRequestException(
          'Variant product requires productVariantId in cart request',
        );
      }

      const variant = await this.variantRepository.findOne({
        where: {
          id: createCartItemDto.productVariantId,
          productId: product.id,
          isActive: true,
        },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found for this product');
      }

      productVariantId = variant.id;
      unitPrice = variant.price;
      unitDiscountPrice = variant.discountPrice;
    }

    const existingItem = await this.cartRepository.findOne({
      where: {
        userId: currentUser.id,
        productId: product.id,
        productVariantId: productVariantId ?? IsNull(),
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.unitPrice = unitPrice;
      existingItem.unitDiscountPrice = unitDiscountPrice;
      return this.cartRepository.save(existingItem);
    }

    const cartItem = this.cartRepository.create({
      userId: currentUser.id,
      productId: product.id,
      productVariantId,
      quantity,
      unitPrice,
      unitDiscountPrice,
    });

    return this.cartRepository.save(cartItem);
  }

  async findAll(currentUser: jwts, query: CartQueryDto) {
    if (query.cartItemId) {
      const cartItem = await this.buildCartQuery(currentUser.id)
        .andWhere('cart.id = :cartItemId', { cartItemId: query.cartItemId })
        .getOne();

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      return {
        mode: 'single',
        data: cartItem,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.buildCartQuery(currentUser.id)
      .orderBy('cart.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      mode: 'list',
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(currentUser: jwts, updateCartItemDto: UpdateCartItemDto) {
    const cartItem = await this.cartRepository.findOne({
      where: {
        id: updateCartItemDto.cartItemId,
        userId: currentUser.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return this.cartRepository.save(cartItem);
  }

  async remove(currentUser: jwts, query: DeleteCartItemQueryDto) {
    if (query.clearAll) {
      const result = await this.cartRepository.delete({
        userId: currentUser.id,
      });

      return {
        deleted: true,
        clearAll: true,
        affected: result.affected ?? 0,
      };
    }

    if (!query.cartItemId) {
      throw new BadRequestException('Provide cartItemId or set clearAll=true');
    }

    const exists = await this.cartRepository.exist({
      where: {
        id: query.cartItemId,
        userId: currentUser.id,
      },
    });

    if (!exists) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.delete({
      id: query.cartItemId,
      userId: currentUser.id,
    });

    return {
      deleted: true,
      cartItemId: query.cartItemId,
    };
  }

  private buildCartQuery(userId: string) {
    return this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product', 'product')
      .leftJoinAndSelect('cart.productVariant', 'variant')
      .where('cart.userId = :userId', { userId })
      .select([
        'cart.id',
        'cart.userId',
        'cart.productId',
        'cart.productVariantId',
        'cart.quantity',
        'cart.unitPrice',
        'cart.unitDiscountPrice',
        'cart.createdAt',
        'cart.updatedAt',
      ])
      .addSelect([
        'product.id',
        'product.thumbnailUrl',
        'product.title',
        'product.slug',
        'product.price',
        'product.discountPrice',
        'product.hasVariants',
        'product.productKind',
        'product.isActive',
      ])
      .addSelect([
        'variant.id',
        'variant.title',
        'variant.sku',
        'variant.price',
        'variant.discountPrice',
        'variant.stock',
        'variant.attributes',
        'variant.isActive',
      ]);
  }
}
