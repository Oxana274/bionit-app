import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/data/loaders";
import { isDemoMode } from "@/lib/env";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getAccessTokenFromCookies } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/domain";

const statuses: OrderStatus[] = ["new", "approved", "assembling", "ready", "issued", "cancelled"];

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { status?: OrderStatus } | null;
  if (!body?.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Некорректный статус заказа." }, { status: 400 });
  }

  try {
    await assertAdmin(accessToken);
    if (isDemoMode) return NextResponse.json({ id: params.orderId, status: body.status });
    const result = await supabaseRpc<{ id: string; status: OrderStatus }>(
      "admin_update_order",
      accessToken,
      { p_order_id: params.orderId, p_status: body.status }
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось обновить заказ.";
    return NextResponse.json({ error: message }, { status: message.includes("прав") ? 403 : 400 });
  }
}
