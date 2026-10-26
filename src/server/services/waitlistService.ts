import { connectDB } from "@/lib/db";
import { WaitlistEntry, IWaitlistEntry } from "@/server/models/WaitlistEntry";
import { SlotOffer, ISlotOffer } from "@/server/models/SlotOffer";
import { Slot, ISlot } from "@/server/models/Slot";
import { Notification } from "@/server/models/Notification";
import { AuditLog } from "@/server/models/AuditLog";
import { rankWaitlistCandidates, WaitlistCandidate } from "@/server/domain/waitlistRanker";
import { Types } from "mongoose";

export class WaitlistService {
  /**
   * Joins the priority waitlist without upfront payment.
   */
  static async joinWaitlist(params: {
    patientId: string;
    doctorId: string;
    dateFrom: string;
    dateTo: string;
    timeOfDay?: "any" | "morning" | "afternoon" | "evening";
    urgency?: "routine" | "soon" | "urgent";
    symptomNotes?: string;
    isFollowUp?: boolean;
  }): Promise<IWaitlistEntry> {
    await connectDB();

    // Check if patient already has active waitlist for this doctor/date
    const existing = await WaitlistEntry.findOne({
      patientId: new Types.ObjectId(params.patientId),
      doctorId: new Types.ObjectId(params.doctorId),
      dateFrom: params.dateFrom,
      status: { $in: ["waiting", "offered"] },
    });

    if (existing) {
      return existing;
    }

    const entry = await WaitlistEntry.create({
      patientId: new Types.ObjectId(params.patientId),
      doctorId: new Types.ObjectId(params.doctorId),
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      timeOfDay: params.timeOfDay || "any",
      urgency: params.urgency || "routine",
      symptomNotes: params.symptomNotes || "",
      isFollowUp: Boolean(params.isFollowUp),
      status: "waiting",
      declinedCount: 0,
      joinedAt: new Date(),
    });

    await AuditLog.create({
      actorId: entry.patientId,
      action: "WAITLIST_JOINED",
      entityType: "WaitlistEntry",
      entityId: entry._id.toString(),
      meta: { urgency: entry.urgency, doctorId: params.doctorId },
    });

    return entry;
  }

  /**
   * Leaves the waitlist.
   */
  static async leaveWaitlist(entryId: string, patientId: string): Promise<boolean> {
    await connectDB();
    const res = await WaitlistEntry.updateOne(
      { _id: entryId, patientId: new Types.ObjectId(patientId), status: "waiting" },
      { $set: { status: "left" } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Cascading Engine: triggered when a slot becomes vacant.
   * Ranks all waiting patients dynamically and offers the slot to the #1 ranked candidate
   * with a 15-minute time-limited hold.
   */
  static async triggerSlotCascade(slotId: string | Types.ObjectId): Promise<{
    cascaded: boolean;
    offeredTo?: string;
    offerId?: string;
    reason?: string;
  }> {
    await connectDB();
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return { cascaded: false, reason: "Slot not found" };
    }

    // Find all active waiting entries for this doctor & date
    const waitingEntries = await WaitlistEntry.find({
      doctorId: slot.doctorId,
      dateFrom: { $lte: slot.date },
      dateTo: { $gte: slot.date },
      status: "waiting",
    });

    if (waitingEntries.length === 0) {
      // No patients on waitlist: release slot to public pool
      slot.status = "available";
      slot.heldBy = undefined;
      slot.holdExpiresAt = undefined;
      slot.appointmentId = undefined;
      await slot.save();
      return { cascaded: false, reason: "No waiting patients; slot made available" };
    }

    // Map to candidate objects for pure ranking function
    const candidates: WaitlistCandidate[] = waitingEntries.map((e) => ({
      id: e._id.toString(),
      patientId: e.patientId.toString(),
      urgency: e.urgency,
      joinedAt: e.joinedAt,
      isFollowUp: e.isFollowUp,
      declinedCount: e.declinedCount,
    }));

    const ranked = rankWaitlistCandidates(candidates, new Date());
    const topRanked = ranked[0];
    const topEntry = waitingEntries.find((e) => e._id.toString() === topRanked.entry.id)!;

    // 15-minute countdown offer
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Atomically transition slot to 'held_for_offer'
    slot.status = "held_for_offer";
    slot.heldBy = topEntry.patientId;
    slot.holdExpiresAt = expiresAt;
    await slot.save();

    // Create SlotOffer document
    const offer = await SlotOffer.create({
      slotId: slot._id,
      waitlistEntryId: topEntry._id,
      patientId: topEntry.patientId,
      expiresAt,
      status: "pending",
      rankScore: topRanked.score,
      rankBreakdown: topRanked.breakdown,
    });

    // Update waitlist entry to offered
    topEntry.status = "offered";
    await topEntry.save();

    // Send high-priority notification to patient
    await Notification.create({
      userId: topEntry.patientId,
      type: "WAITLIST_OFFER",
      title: "Golden Ticket: Consultation Slot Available!",
      body: `A slot on ${slot.date} at ${slot.startTime} has opened up. You have 15 minutes to pay and confirm.`,
      link: "/waitlist",
    });

    await AuditLog.create({
      action: "SLOT_OFFERED_TO_WAITLIST",
      entityType: "SlotOffer",
      entityId: offer._id.toString(),
      meta: {
        slotId: slot._id.toString(),
        patientId: topEntry.patientId.toString(),
        score: topRanked.score,
      },
    });

    return {
      cascaded: true,
      offeredTo: topEntry.patientId.toString(),
      offerId: offer._id.toString(),
    };
  }

  /**
   * Evaluates expired offers and cascades the slot to the next patient in line.
   */
  static async processExpiredOffers(): Promise<number> {
    await connectDB();
    const now = new Date();

    const expiredOffers = await SlotOffer.find({
      status: "pending",
      expiresAt: { $lt: now },
    });

    let cascadeCount = 0;

    for (const offer of expiredOffers) {
      offer.status = "expired";
      await offer.save();

      // Increment declinedCount and reset waitlist entry to waiting
      await WaitlistEntry.updateOne(
        { _id: offer.waitlistEntryId },
        {
          $inc: { declinedCount: 1 },
          $set: { status: "waiting" },
        }
      );

      // Cascade slot to Patient #2
      await this.triggerSlotCascade(offer.slotId);
      cascadeCount++;
    }

    return cascadeCount;
  }

  /**
   * Responds to an offer (Accept or Decline).
   */
  static async respondToOffer(
    offerId: string,
    patientId: string,
    action: "accept" | "decline"
  ): Promise<{ success: boolean; message: string; slotId?: string }> {
    await connectDB();
    const offer = await SlotOffer.findById(offerId);

    if (!offer || offer.patientId.toString() !== patientId) {
      throw new Error("Offer not found or unauthorized");
    }

    if (offer.status !== "pending") {
      throw new Error(`Offer is already ${offer.status}`);
    }

    if (new Date() > new Date(offer.expiresAt)) {
      offer.status = "expired";
      await offer.save();
      await this.triggerSlotCascade(offer.slotId);
      throw new Error("This 15-minute offer has expired.");
    }

    if (action === "accept") {
      offer.status = "accepted";
      await offer.save();

      await WaitlistEntry.updateOne(
        { _id: offer.waitlistEntryId },
        { $set: { status: "accepted" } }
      );

      return {
        success: true,
        message: "Offer accepted! Proceed to checkout.",
        slotId: offer.slotId.toString(),
      };
    } else {
      // Declined
      offer.status = "declined";
      await offer.save();

      await WaitlistEntry.updateOne(
        { _id: offer.waitlistEntryId },
        {
          $inc: { declinedCount: 1 },
          $set: { status: "waiting" },
        }
      );

      // Cascade immediately to next candidate
      await this.triggerSlotCascade(offer.slotId);

      return {
        success: true,
        message: "Offer declined. Slot has cascaded to the next waiting patient.",
      };
    }
  }
}
