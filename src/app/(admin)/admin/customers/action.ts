"use server";

import { isPastIstCalendarDay } from "@/lib/datetime";
import type { Coupon } from "@/types/TypeInterface";

export async function isCouponExpired(
  coupon: Pick<Coupon, "valid_until">
): Promise<boolean> {
  return isPastIstCalendarDay(coupon.valid_until);
}
