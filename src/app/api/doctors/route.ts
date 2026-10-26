import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/server/models/DoctorProfile";
import { Specialty } from "@/server/models/Specialty";
import { User } from "@/server/models/User";
import { FacilityRoom } from "@/server/models/FacilityRoom";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Touch models to prevent Next.js bundler tree-shaking and guarantee schema registration in Mongoose
    [FacilityRoom, Specialty, User, DoctorProfile].forEach((model) => {
      if (model && model.modelName) {
        // Registered
      }
    });

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.toLowerCase().trim();
    const specialtySlug = searchParams.get("specialty");
    const symptom = searchParams.get("symptom")?.toLowerCase().trim();
    const minFee = searchParams.get("minFee");
    const maxFee = searchParams.get("maxFee");
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort") || "rating";

    let specialtyFilterIds: any[] | null = null;

    // Check symptom matching
    if (symptom) {
      const matchingSpecialties = await Specialty.find({
        $or: [
          { keywords: { $regex: symptom, $options: "i" } },
          { name: { $regex: symptom, $options: "i" } },
        ],
      }).select("_id");
      specialtyFilterIds = matchingSpecialties.map((s) => s._id);
    } else if (specialtySlug && specialtySlug !== "all") {
      const spec = await Specialty.findOne({ slug: specialtySlug }).select("_id");
      if (spec) {
        specialtyFilterIds = [spec._id];
      }
    }

    const query: any = { approved: true };

    if (specialtyFilterIds !== null) {
      query.specialtyId = { $in: specialtyFilterIds };
    }

    if (minFee || maxFee) {
      query.fee = {};
      if (minFee) query.fee.$gte = Number(minFee);
      if (maxFee) query.fee.$lte = Number(maxFee);
    }

    if (minRating) {
      query.ratingAvg = { $gte: Number(minRating) };
    }

    let sortOptions: any = { ratingAvg: -1 };
    if (sort === "fee_asc") sortOptions = { fee: 1 };
    if (sort === "fee_desc") sortOptions = { fee: -1 };
    if (sort === "experience") sortOptions = { experienceYears: -1 };

    // Corrected path from "assignedRoom" to "assignedRoomId" to match DoctorProfile schema definition
    let doctors = await DoctorProfile.find(query)
      .populate("userId", "name email image phone")
      .populate("specialtyId")
      .populate("assignedRoomId", "name equipment")
      .sort(sortOptions)
      .lean();

    // Text search filter on doctor name or bio
    if (q) {
      doctors = doctors.filter((doc: any) => {
        const docName = doc.userId?.name?.toLowerCase() || "";
        const bio = doc.bio?.toLowerCase() || "";
        const specName = doc.specialtyId?.name?.toLowerCase() || "";
        return docName.includes(q) || bio.includes(q) || specName.includes(q);
      });
    }

    const specialties = await Specialty.find({}).lean();

    return NextResponse.json({
      doctors,
      specialties,
      total: doctors.length,
    });
  } catch (error: any) {
    console.error("GET /api/doctors error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}