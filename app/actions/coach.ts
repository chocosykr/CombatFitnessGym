"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markSubscriptionPaid(userId: string, planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify caller is coach
  if (!user || user.phone !== process.env.COACH_PHONE_NUMBER) {
    throw new Error("Unauthorized");
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 30);

  // Update or insert subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      start_date: new Date().toISOString().split('T')[0],
      next_due_date: nextDueDate.toISOString().split('T')[0],
      status: 'active'
    }, { onConflict: 'user_id' }); // Assuming 1 active sub per user for simplicity

  if (error) throw new Error(error.message);

  revalidatePath("/coach/members");
  return { success: true };
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.phone !== process.env.COACH_PHONE_NUMBER) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from('plans')
    .insert({
      name,
      price_monthly: Number(price),
      description
    });

  if (error) throw new Error(error.message);

  revalidatePath("/coach/plans");
  return { success: true };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.phone !== process.env.COACH_PHONE_NUMBER) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("image_url") as string;

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      price: Number(price),
      description,
      image_url: imageUrl || null
    }).select().single();

  if (error) throw new Error(error.message);

  // Initialize inventory for S, M, L, XL with 10 stock each for demo purposes
  const sizes = ['S', 'M', 'L', 'XL'];
  const invInserts = sizes.map(size => ({
    product_id: product.id,
    size,
    stock: 10
  }));

  await supabase.from('inventory').insert(invInserts);

  revalidatePath("/coach/inventory");
  return { success: true };
}

export async function markOrderShipped(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.phone !== process.env.COACH_PHONE_NUMBER) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('orders')
    .update({ status: 'shipped' })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/coach/orders");
  return { success: true };
}

