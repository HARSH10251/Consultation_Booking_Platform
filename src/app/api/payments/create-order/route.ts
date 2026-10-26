import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Slot } from "@/server/models/Slot";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { createRazorpayOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    await connectDB();
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Verify slot is held by this user
    if (slot.status !== "held" || slot.heldBy?.toString() !== user.id) {
      return NextResponse.json(
        { error: "Slot must be held by the current user to initiate payment" },
        { status: 400 }
      );
    }

    const doctor = await DoctorProfile.findById(slot.doctorId);
    const doctorFee = doctor?.fee || 1000;
    const gstTax = Math.round(doctorFee * 0.18);
    const totalAmount = doctorFee + gstTax;

    const receiptId = `rcpt_${Date.now()}`;
    const order = await createRazorpayOrder(totalAmount, receiptId);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      doctorFee,
      gstTax,
      totalAmount,
      isMock: order.isMock,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_KeyId12345678",
    });
  } catch (error: any) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
