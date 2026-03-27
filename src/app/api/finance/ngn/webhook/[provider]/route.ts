import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Mock DB objects for testing locally
const db = {
  fiat_transactions: {
    findUnique: async ({ where }: { where: { reference: string } }) => {
      // Mock transaction
      if (where.reference === "ref123") {
        return { reference: "ref123", status: "pending", organization_id: "org001" };
      }
      return null;
    },
    update: async ({ where, data }: any) => {
      console.log("Mock DB Update: fiat_transactions", where, data);
    },
  },
  organization_fiat_balances: {
    update: async ({ where, data }: any) => {
      console.log("Mock DB Update: organization_fiat_balances", where, data);
    },
  },
  webhook_audit_logs: {
    create: async ({ data }: any) => {
      console.log("Mock Audit Log:", data);
    },
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  try {
    const rawBody = await req.text();

    switch (provider) {
      case "monnify":
        return await handleMonnifyWebhook(req, rawBody);
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function verifyMonnifySignature(rawBody: string, signature: string) {
  const secret = process.env.MONNIFY_SECRET_KEY || "test"; // fallback for local testing
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

async function handleMonnifyWebhook(req: NextRequest, rawBody: string) {
  const signature = req.headers.get("monnify-signature");

  if (!signature || !verifyMonnifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // Log payload (audit log + console)
  await logWebhookPayload("monnify", payload);

  if (payload.eventType === "SUCCESSFUL_TRANSACTION") {
    const eventData = payload.eventData;
    await processSuccessfulDeposit(eventData.paymentReference, eventData.amount);
  }

  return NextResponse.json({ status: "ok" });
}

async function processSuccessfulDeposit(reference: string, amount: number) {
  const transaction = await db.fiat_transactions.findUnique({
    where: { reference },
  });

  if (!transaction) {
    console.warn("Transaction not found:", reference);
    return;
  }

  if (transaction.status === "success") return; // prevent duplicate processing

  // Update transaction status
  await db.fiat_transactions.update({
    where: { reference },
    data: { status: "success" },
  });

  // Increment organization balance
  await db.organization_fiat_balances.update({
    where: { organization_id: transaction.organization_id },
    data: { balance: { increment: amount } },
  });
}

async function logWebhookPayload(provider: string, payload: any) {
  await db.webhook_audit_logs.create({ data: { provider, payload } });
}