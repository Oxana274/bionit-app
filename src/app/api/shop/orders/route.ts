import { NextResponse } from "next/server";
import { getDemoProfile, getDemoShop } from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies, getDemoProfileIdFromToken } from "@/lib/supabase/server";
import type { ProfileSummary, ShopOrder } from "@/types/domain";

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    productId?: string;
    variantId?: string | null;
    quantity?: number;
  } | null;
  const quantity = Number(body?.quantity ?? 1);
  if (!body?.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return NextResponse.json({ error: "Проверьте товар и количество." }, { status: 400 });
  }

  try {
    if (isDemoMode) {
      const profileId = getDemoProfileIdFromToken(accessToken);
      const profile = getDemoProfile(profileId);
      const product = getDemoShop(profileId).products.find((item) => item.id === body.productId);
      if (!product) throw new Error("Товар не найден.");
      const variant = body.variantId
        ? product.variants.find((item) => item.id === body.variantId)
        : null;
      if (product.variants.length > 0 && !variant) throw new Error("Выберите вариант товара.");
      const stock = variant?.stock ?? product.stock;
      if (stock < quantity) throw new Error("Недостаточно товара на складе.");
      const total = product.price * quantity;
      if (profile.balance < total) throw new Error("Недостаточно Биоников.");
      const order: ShopOrder = {
        id: crypto.randomUUID(),
        number: `BD-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        productTitle: product.title,
        variantTitle: variant?.title ?? null,
        quantity,
        total,
        status: "new",
        createdAt: new Date().toISOString()
      };
      return NextResponse.json({ order, balance: profile.balance - order.total });
    }

    const order = await supabaseRpc<ShopOrder>("create_shop_order", accessToken, {
      p_product_id: body.productId,
      p_variant_id: body.variantId ?? null,
      p_quantity: quantity
    });
    const profile = await supabaseRpc<ProfileSummary>("get_profile_summary", accessToken);
    return NextResponse.json({ order, balance: profile.balance });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось оформить заказ." },
      { status: 400 }
    );
  }
}
