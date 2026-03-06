"use client";

import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const value = params.productId;
  const productId = Array.isArray(value) ? value[0] : value;

  if (!productId) {
    return null;
  }

  return <ProductEditor mode="edit" productId={productId} />;
}
