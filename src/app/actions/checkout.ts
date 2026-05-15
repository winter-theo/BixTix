"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { getCartByUserId } from "@/lib/queries/cart";

export async function createCheckoutSession() {
  const user = await requireUser();
  const cart = await getCartByUserId(user.id);

  if (!cart || cart.items.length === 0) {
    throw new Error("Panier vide");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: { name: item.product.name },
        unit_amount: Math.round(Number(item.product.price) * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/panier`,
    metadata: {
      cartId: cart.id,
      userId: user.id,
    },
  });

  if (!session.url) {
    throw new Error("Erreur Stripe");
  }

  redirect(session.url);
}