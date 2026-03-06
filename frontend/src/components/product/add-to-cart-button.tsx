"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type AddToCartButtonProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string;
    price: number;
    discountPrice: number | null;
    productVariantId?: string | null;
  };
  className?: string;
  label?: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function AddToCartButton({
  product,
  className,
  label = "Add to Cart",
  disabled = false,
  variant = "default",
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }

        addItem({
          productId: product.id,
          productVariantId: product.productVariantId ?? null,
          slug: product.slug,
          title: product.title,
          thumbnailUrl: product.thumbnailUrl,
          unitPrice: product.price,
          unitDiscountPrice: product.discountPrice,
        });
        toast.success("Added to cart");
      }}
    >
      <ShoppingCart className="mr-2 size-4" />
      {label}
    </Button>
  );
}
