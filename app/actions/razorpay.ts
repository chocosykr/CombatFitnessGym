"use server";

import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/utils/supabase/server";

export async function createRazorpayOrder(amountInPaise: number, planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Create order via Razorpay API
  // Using a try-catch to mock if keys are invalid during dev
  try {
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        planId: planId,
        type: "subscription"
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Save pending payment record in DB
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: amountInPaise / 100,
      razorpay_order_id: order.id,
      status: "created",
      payment_type: "subscription",
    });

    return { success: true, order };
  } catch (err: any) {
    console.error("Razorpay Error:", err);
    
    // Dev Mock Fallback: if Razorpay throws (e.g. missing keys), return a mock order
    if (!process.env.RAZORPAY_KEY_SECRET) {
      const mockOrderId = "order_mock_" + Date.now();
      await supabase.from("payments").insert({
        user_id: user.id,
        amount: amountInPaise / 100,
        razorpay_order_id: mockOrderId,
        status: "created",
        payment_type: "subscription",
      });
      return { 
        success: true, 
        order: { id: mockOrderId, amount: amountInPaise, currency: "INR" }, 
        mock: true 
      };
    }
    
    throw new Error("Failed to create payment order");
  }
}

export async function createShopOrder(amountInPaise: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_shop_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: { userId: user.id, type: "shop" }
    };
    
    const order = await razorpay.orders.create(options);
    
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: amountInPaise / 100,
      razorpay_order_id: order.id,
      status: "created",
      payment_type: "shop",
    });

    return { success: true, order };
  } catch (err: any) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      const mockOrderId = "order_mock_shop_" + Date.now();
      await supabase.from("payments").insert({
        user_id: user.id,
        amount: amountInPaise / 100,
        razorpay_order_id: mockOrderId,
        status: "created",
        payment_type: "shop",
      });
      return { success: true, order: { id: mockOrderId, amount: amountInPaise, currency: "INR" }, mock: true };
    }
    throw new Error("Failed to create shop order");
  }
}
