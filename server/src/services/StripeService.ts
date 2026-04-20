import Stripe from "stripe";
import { UserRepository } from "../repositories/UserRepository";

const userRepository = new UserRepository();

// Make sure to add this to .env: STRIPE_SECRET_KEY = sk_test_...
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-06-20" as any, // Using latest compatible version
});

export class StripeService {
    /**
     * Create or retrieve a Stripe customer
     */
    static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
        const user = await userRepository.getUserById(userId);
        if (!user) throw new Error("User not found");

        if (user.stripeCustomerId) {
            return user.stripeCustomerId;
        }

        const customer = await stripe.customers.create({
            email,
            metadata: { userId },
        });

        await userRepository.updateUser(userId, { stripeCustomerId: customer.id });
        return customer.id;
    }

    /**
     * Create a Checkout Session for Subscription
     */
    static async createCheckoutSession(userId: string, email: string): Promise<string> {
        const customerId = await this.getOrCreateCustomer(userId, email);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        // IMPORTANT: Add STRIPE_PRICE_ID to .env
        const priceId = process.env.STRIPE_PRICE_ID; 
        if (!priceId) {
            throw new Error("Stripe Price ID is not configured in .env");
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/pricing?canceled=true`,
        });

        if (!session.url) {
            throw new Error("Failed to create Stripe checkout session");
        }

        return session.url;
    }

    /**
     * Handle Stripe Webhooks
     */
    static async handleWebhookEvent(body: Buffer, signature: string) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Stripe Webhook Secret is not configured");
        }

        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.customer) {
                await this.updateUserPlan(session.customer as string, "pro", "active");
            }
        } else if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;
            await this.updateUserPlan(subscription.customer as string, "free", "canceled");
        } else if (event.type === "invoice.payment_failed") {
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.customer) {
                await this.updateUserPlan(invoice.customer as string, "free", "past_due");
            }
        }
    }

    /**
     * Utility to update user's plan state based on Stripe events
     */
    private static async updateUserPlan(stripeCustomerId: string, planType: string, subscriptionStatus: string) {
        // We use raw Prisma client since UserRepository doesn't expose a findByStripeCustomerId
        const { prisma } = await import("../prisma");
        await prisma.user.updateMany({
            where: { stripeCustomerId },
            data: {
                planType,
                subscriptionStatus,
            },
        });
    }
}
