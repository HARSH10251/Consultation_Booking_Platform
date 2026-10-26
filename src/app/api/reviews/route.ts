import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Review } from "@/server/models/Review";
import { Appointment } from "@/server/models/Appointment";
import { DoctorProfile } from "@/server/models/DoctorProfile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await req.json();
    const { appointmentId, rating, comment } = body;

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: "appointmentId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.patientId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: only the patient can review this appointment" },
        { status: 403 }
      );
    }

    if (appointment.status !== "completed") {
      return NextResponse.json(
        { error: "Reviews can only be submitted for completed consultations" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existing = await Review.findOne({ appointmentId });
    if (existing) {
      return NextResponse.json(
        { error: "A review has already been submitted for this consultation" },
        { status: 409 }
      );
    }

    const review = await Review.create({
      appointmentId,
      patientId: user.id,
      doctorId: appointment.doctorId,
      rating: Number(rating),
      comment: comment || "",
    });

    // Update doctor's aggregate rating
    const allDocReviews = await Review.find({ doctorId: appointment.doctorId });
    const totalScore = allDocReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAvg = +(totalScore / allDocReviews.length).toFixed(1);

    await DoctorProfile.updateOne(
      { _id: appointment.doctorId },
      {
        $set: {
          ratingAvg,
          ratingCount: allDocReviews.length,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for reviewing your doctor!",
      review,
    });
  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
