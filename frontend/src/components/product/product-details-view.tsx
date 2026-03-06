"use client";

import { useSitePreferences } from "@/components/site/site-preferences-provider";
import { renderProductDetailsLayout } from "@/components/product/product-details-view.layouts";
import type { ProductDetailsViewProps } from "@/components/product/product-details-view.types";
import {
  buildActionProduct,
  buildViewState,
} from "@/components/product/product-details-view.utils";

export function ProductDetailsView(props: ProductDetailsViewProps) {
  const { productDetailsVariant } = useSitePreferences();
  const view = buildViewState(props.product, props.variants);
  const actionProduct = buildActionProduct(props);
  const layoutProps = { ...props, actionProduct, view };

  return renderProductDetailsLayout(productDetailsVariant, layoutProps);
}
