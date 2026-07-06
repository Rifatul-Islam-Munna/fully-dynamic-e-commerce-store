const promoDesigns = "original:Standard Banner|split_offer:Split Layout|poster:Poster Layout|strip:Compact Strip|inset_card:Inset Card|image_edge:Image Edge|ribbon_banner:Ribbon Layout|glassmorphic:Glass Panel|countdown_style:Timed Layout|minimal_bar:Minimal Bar|hero_discount:Large Banner";

export const promoSectionVariants = promoDesigns
  .split("|")
  .map((entry) => entry.split(":")) as [string, string][];
