import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.metadata?.clerkUserId;
    const subscriptionId = session.subscription as string;

    if (clerkUserId && subscriptionId) {
      await prisma.user.upsert({
        where: { clerkUserId },
        update: {
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        },
        create: {
          clerkUserId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        },
      });
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status; // "active", "canceled", "past_due"

    await prisma.user.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { subscriptionStatus: status },
    });
  }

  return NextResponse.json({ received: true });
}
