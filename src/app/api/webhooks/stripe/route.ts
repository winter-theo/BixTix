import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

function generateLicenseKey(): string {
  const segment = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const cartId = session.metadata?.cartId;
  const userId = session.metadata?.userId;

  if (!cartId || !userId) {
    console.error("Webhook: metadonnees manquantes");
    return;
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    console.warn("Webhook: panier introuvable ou vide", cartId);
    return;
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.price),
    0
  );

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: "PAID",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
    });

    const licenses = cart.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        key: generateLicenseKey(),
        userId,
        productId: item.productId,
        orderId: order.id,
      }))
    );

    if (licenses.length > 0) {
      await tx.license.createMany({ data: licenses });
    }

    await tx.cartItem.deleteMany({ where: { cartId } });
  });

  console.log(`Webhook: commande creee pour user ${userId}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook: signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        console.warn(`Webhook: paiement echoue/expire (${event.type})`);
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook: erreur traitement", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
