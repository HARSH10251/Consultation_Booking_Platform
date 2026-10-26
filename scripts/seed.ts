import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/server/models/User";
import { Specialty } from "../src/server/models/Specialty";
import { FacilityRoom } from "../src/server/models/FacilityRoom";
import { DoctorProfile } from "../src/server/models/DoctorProfile";
import { Slot } from "../src/server/models/Slot";
import { Appointment } from "../src/server/models/Appointment";
import { PaymentTransaction } from "../src/server/models/PaymentTransaction";
import { WaitlistEntry } from "../src/server/models/WaitlistEntry";
import { Notification } from "../src/server/models/Notification";
import { AuditLog } from "../src/server/models/AuditLog";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careslot";

async function seed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log("🧹 Clearing old database records...");
  await Promise.all([
    User.deleteMany({}),
    Specialty.deleteMany({}),
    FacilityRoom.deleteMany({}),
    DoctorProfile.deleteMany({}),
    Slot.deleteMany({}),
    Appointment.deleteMany({}),
    PaymentTransaction.deleteMany({}),
    WaitlistEntry.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Create Specialties (8 specialties)
  console.log("🩺 Creating Specialties...");
  const specialtiesData = [
    {
      name: "Cardiology",
      slug: "cardiology",
      icon: "HeartPulse",
      keywords: ["heart", "chest pain", "palpitation", "hypertension", "bp", "arrhythmia"],
    },
    {
      name: "Dermatology",
      slug: "dermatology",
      icon: "Sparkles",
      keywords: ["skin", "acne", "rash", "eczema", "hair fall", "dermatitis"],
    },
    {
      name: "Pediatrics",
      slug: "pediatrics",
      icon: "Baby",
      keywords: ["child", "infant", "fever", "vaccination", "growth", "cough"],
    },
    {
      name: "Orthopedics",
      slug: "orthopedics",
      icon: "Bone",
      keywords: ["joint pain", "fracture", "back pain", "arthritis", "ligament", "knee"],
    },
    {
      name: "Neurology",
      slug: "neurology",
      icon: "Brain",
      keywords: ["migraine", "headache", "vertigo", "seizure", "numbness", "nerve"],
    },
    {
      name: "General Medicine",
      slug: "general-medicine",
      icon: "Stethoscope",
      keywords: ["fever", "weakness", "infection", "cold", "flu", "diabetes", "checkup"],
    },
    {
      name: "ENT Specialist",
      slug: "ent",
      icon: "Headphones",
      keywords: ["ear", "nose", "throat", "sinus", "tonsils", "hearing", "voice"],
    },
    {
      name: "Ophthalmology",
      slug: "ophthalmology",
      icon: "Eye",
      keywords: ["eye", "vision", "blur", "dry eyes", "cataract", "glaucoma"],
    },
  ];

  const specialties = await Specialty.insertMany(specialtiesData);
  const specMap = new Map(specialties.map((s) => [s.slug, s._id]));

  // 2. Create Facility Rooms (5 clinic rooms)
  console.log("🏥 Creating Clinic Rooms...");
  const roomsData = [
    { name: "Exam Room 1 - General", equipment: ["BP Monitor", "ECG", "Stethoscope", "Otoscope"], isAvailable: true },
    { name: "Exam Room 2 - Cardiology", equipment: ["Echocardiogram", "Stress Test Treadmill", "12-Lead ECG"], isAvailable: true },
    { name: "Ultrasound & Imaging Suite", equipment: ["Sonography Unit B", "Doppler Pro", "Exam Couch"], isAvailable: true },
    { name: "Minor Procedures & OT", equipment: ["Surgical Light", "Cautery", "Sterilization Bay"], isAvailable: true },
    { name: "Pediatric Bay & Playroom", equipment: ["Pediatric Scale", "Nebulizer", "Distraction Toys"], isAvailable: true },
  ];
  const rooms = await FacilityRoom.insertMany(roomsData);

  // 3. Create Admin User
  console.log("👑 Creating Admin User...");
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const adminUser = await User.create({
    name: "Chief Admin Sarah",
    email: "admin@careslot.demo",
    passwordHash: adminPasswordHash,
    role: "admin",
    phone: "+91 99000 11000",
    status: "active",
  });

  // 4. Create Doctors (12 Doctors)
  console.log("👨‍⚕️ Creating 12 Doctors with rolling schedules...");
  const doctorPasswordHash = await bcrypt.hash("Doctor@123", 10);

  const doctorsSeed = [
    {
      name: "Dr. Arvind Mehta",
      email: "doctor@careslot.demo", // standard primary demo doctor
      specialty: "cardiology",
      qualifications: ["MBBS", "MD (Cardiology)", "FACC"],
      experienceYears: 16,
      fee: 1200,
      bio: "Senior Interventional Cardiologist with over 16 years of expertise in preventive cardiology and heart health management.",
      languages: ["English", "Hindi", "Gujarati"],
      roomIndex: 1,
    },
    {
      name: "Dr. Ananya Roy",
      email: "dr.ananya@careslot.demo",
      specialty: "dermatology",
      qualifications: ["MBBS", "MD (Dermatology)", "FAAD"],
      experienceYears: 11,
      fee: 900,
      bio: "Consultant Dermatologist and Aesthetic Specialist focusing on clinical skin conditions and laser therapy.",
      languages: ["English", "Hindi", "Bengali"],
      roomIndex: 0,
    },
    {
      name: "Dr. Vikram Sethi",
      email: "dr.vikram@careslot.demo",
      specialty: "pediatrics",
      qualifications: ["MBBS", "DNB (Pediatrics)", "Fellow Pediatric Critical Care"],
      experienceYears: 14,
      fee: 800,
      bio: "Compassionate pediatrician devoted to child wellness, immunization schedules, and childhood infection prevention.",
      languages: ["English", "Hindi", "Punjabi"],
      roomIndex: 4,
    },
    {
      name: "Dr. Rajeshwar Iyer",
      email: "dr.rajeshwar@careslot.demo",
      specialty: "orthopedics",
      qualifications: ["MBBS", "MS (Orthopedics)", "MCh (Joint Replacement)"],
      experienceYears: 19,
      fee: 1500,
      bio: "Renowned orthopedic surgeon specializing in robotic joint replacements, sports injuries, and spine rehabilitation.",
      languages: ["English", "Tamil", "Hindi"],
      roomIndex: 3,
    },
    {
      name: "Dr. Meenakshi Sundaram",
      email: "dr.meenakshi@careslot.demo",
      specialty: "neurology",
      qualifications: ["MBBS", "DM (Neurology)", "MRCP (UK)"],
      experienceYears: 13,
      fee: 1400,
      bio: "Consultant Neurologist focusing on chronic migraines, movement disorders, and stroke rehabilitation.",
      languages: ["English", "Malayalam", "Hindi"],
      roomIndex: 0,
    },
    {
      name: "Dr. Siddharth Sen",
      email: "dr.siddharth@careslot.demo",
      specialty: "general-medicine",
      qualifications: ["MBBS", "MD (Internal Medicine)"],
      experienceYears: 10,
      fee: 600,
      bio: "Internal medicine specialist offering holistic primary care, lifestyle disease management, and metabolic health checks.",
      languages: ["English", "Hindi"],
      roomIndex: 0,
    },
    {
      name: "Dr. Kavita Nambiar",
      email: "dr.kavita@careslot.demo",
      specialty: "ent",
      qualifications: ["MBBS", "MS (ENT)", "DORL"],
      experienceYears: 12,
      fee: 750,
      bio: "Otolaryngologist skilled in endoscopic sinus surgery, micro-ear surgery, and pediatric airway evaluations.",
      languages: ["English", "Malayalam", "Hindi"],
      roomIndex: 3,
    },
    {
      name: "Dr. Prateek Sharma",
      email: "dr.prateek@careslot.demo",
      specialty: "ophthalmology",
      qualifications: ["MBBS", "MS (Ophthalmology)", "FICO"],
      experienceYears: 15,
      fee: 850,
      bio: "Cornea & Refractive Surgeon with advanced expertise in computer vision syndrome, LASIK, and cataract management.",
      languages: ["English", "Hindi"],
      roomIndex: 2,
    },
    {
      name: "Dr. Priya Bansal",
      email: "dr.priya@careslot.demo",
      specialty: "cardiology",
      qualifications: ["MBBS", "MD", "DM (Cardiology)"],
      experienceYears: 9,
      fee: 1100,
      bio: "Cardiovascular specialist with passion for women's heart health, hypertension tracking, and cardio-metabolic risk reduction.",
      languages: ["English", "Hindi"],
      roomIndex: 1,
    },
    {
      name: "Dr. Rohan Deshmukh",
      email: "dr.rohan@careslot.demo",
      specialty: "dermatology",
      qualifications: ["MBBS", "DDVL", "DNB"],
      experienceYears: 8,
      fee: 700,
      bio: "Dermatologist with active interest in chronic psoriasis management, dermatosurgery, and pediatric dermatology.",
      languages: ["English", "Marathi", "Hindi"],
      roomIndex: 0,
    },
    {
      name: "Dr. Sunita Rao",
      email: "dr.sunita@careslot.demo",
      specialty: "pediatrics",
      qualifications: ["MBBS", "MD (Pediatrics)"],
      experienceYears: 17,
      fee: 850,
      bio: "Senior Child Specialist providing empathetic developmental guidance, asthma care, and nutritional counseling.",
      languages: ["English", "Telugu", "Hindi"],
      roomIndex: 4,
    },
    {
      name: "Dr. Harshavardhan Varma",
      email: "dr.harsha@careslot.demo",
      specialty: "orthopedics",
      qualifications: ["MBBS", "MS (Ortho)", "Fellow Sports Medicine"],
      experienceYears: 12,
      fee: 1300,
      bio: "Sports injury specialist and arthroscopic surgeon serving professional athletes and active individuals.",
      languages: ["English", "Telugu", "Hindi"],
      roomIndex: 3,
    },
  ];

  const createdDoctorProfiles = [];

  for (const doc of doctorsSeed) {
    const user = await User.create({
      name: doc.name,
      email: doc.email,
      passwordHash: doctorPasswordHash,
      role: "doctor",
      status: "active",
      phone: "+91 98000 " + Math.floor(10000 + Math.random() * 90000),
    });

    const specialtyId = specMap.get(doc.specialty);
    const assignedRoomId = rooms[doc.roomIndex]._id;

    const profile = await DoctorProfile.create({
      userId: user._id,
      specialtyId,
      qualifications: doc.qualifications,
      experienceYears: doc.experienceYears,
      fee: doc.fee,
      bio: doc.bio,
      languages: doc.languages,
      assignedRoomId,
      slotDurationMin: 30,
      bufferMin: 5,
      ratingAvg: +(4.5 + Math.random() * 0.5).toFixed(1),
      ratingCount: Math.floor(18 + Math.random() * 80),
      approved: true,
      weeklySchedule: [
        {
          day: 1, // Mon
          ranges: [{ start: "09:00", end: "17:00" }],
          breaks: [{ start: "13:00", end: "14:00" }],
        },
        {
          day: 2, // Tue
          ranges: [{ start: "09:00", end: "17:00" }],
          breaks: [{ start: "13:00", end: "14:00" }],
        },
        {
          day: 3, // Wed
          ranges: [{ start: "09:00", end: "17:00" }],
          breaks: [{ start: "13:00", end: "14:00" }],
        },
        {
          day: 4, // Thu
          ranges: [{ start: "09:00", end: "17:00" }],
          breaks: [{ start: "13:00", end: "14:00" }],
        },
        {
          day: 5, // Fri
          ranges: [{ start: "09:00", end: "17:00" }],
          breaks: [{ start: "13:00", end: "14:00" }],
        },
        {
          day: 6, // Sat (half day)
          ranges: [{ start: "09:30", end: "13:30" }],
          breaks: [],
        },
      ],
    });

    createdDoctorProfiles.push({ profile, user });
  }

  // 5. Create Patients (25 patients, including primary demo patient)
  console.log("👥 Creating 25 Patients...");
  const patientPasswordHash = await bcrypt.hash("Patient@123", 10);

  const demoPatient = await User.create({
    name: "Rohan Verma",
    email: "patient@careslot.demo",
    passwordHash: patientPasswordHash,
    role: "patient",
    status: "active",
    phone: "+91 91234 56789",
  });

  const patientNames = [
    "Aarav Patel", "Diya Sharma", "Kabir Khan", "Ishaan Nair", "Ananya Gupta",
    "Aditya Joshi", "Pooja Hegde", "Siddharth Rao", "Neha Saxena", "Tarun Kapoor",
    "Shruti Menon", "Kunal Chopra", "Ritu Singhal", "Gaurav Bhatt", "Meera Pillai",
    "Varun Bajaj", "Kavya Reddy", "Nikhil Malhotra", "Tanvi Sengupta", "Manish Pandey",
    "Sonia Paul", "Alok Deshpande", "Zoya Mirza", "Devendra Jha",
  ];

  const patients = [demoPatient];
  for (let i = 0; i < patientNames.length; i++) {
    const p = await User.create({
      name: patientNames[i],
      email: `patient${i + 1}@careslot.demo`,
      passwordHash: patientPasswordHash,
      role: "patient",
      status: "active",
      phone: `+91 97000 ${10000 + i}`,
    });
    patients.push(p);
  }

  // 6. Generate concrete Slots for rolling 7 days for the doctors
  console.log("📅 Generating concrete slots and booking history...");
  const today = new Date();
  const primaryDoc = createdDoctorProfiles[0].profile;

  const slotTimes = [
    { start: "09:00", end: "09:30" },
    { start: "09:30", end: "10:00" },
    { start: "10:00", end: "10:30" },
    { start: "10:30", end: "11:00" },
    { start: "11:00", end: "11:30" },
    { start: "11:30", end: "12:00" },
    { start: "14:00", end: "14:30" },
    { start: "14:30", end: "15:00" },
    { start: "15:00", end: "15:30" },
    { start: "15:30", end: "16:00" },
    { start: "16:00", end: "16:30" },
  ];

  let appointmentCount = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split("T")[0];

    for (const docObj of createdDoctorProfiles.slice(0, 4)) {
      const doc = docObj.profile;
      for (let sIdx = 0; sIdx < slotTimes.length; sIdx++) {
        const slotTime = slotTimes[sIdx];
        const [h, m] = slotTime.start.split(":").map(Number);
        const startAt = new Date(targetDate);
        startAt.setHours(h, m, 0, 0);

        let status: any = "available";
        let bookedPatient: any = null;

        // Book some slots for today and future to create realistic queue and full-capacity waitlists
        if (dayOffset === 0 && sIdx < 4) {
          status = "booked";
          bookedPatient = patients[sIdx];
        } else if (dayOffset === 1 && doc._id.toString() === primaryDoc._id.toString()) {
          // Make day 1 completely booked for Dr. Arvind Mehta to demonstrate the smart waitlist engine!
          status = "booked";
          bookedPatient = patients[(sIdx + 3) % patients.length];
        } else if (dayOffset > 1 && Math.random() < 0.25) {
          status = "booked";
          bookedPatient = patients[Math.floor(Math.random() * patients.length)];
        }

        const slot = await Slot.create({
          doctorId: doc._id,
          roomId: doc.assignedRoomId,
          date: dateStr,
          startTime: slotTime.start,
          endTime: slotTime.end,
          startAt,
          status,
        });

        if (status === "booked" && bookedPatient) {
          const checkInCode = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
          const appointment = await Appointment.create({
            patientId: bookedPatient._id,
            doctorId: doc._id,
            slotId: slot._id,
            startAt,
            status: dayOffset === 0 ? (sIdx === 0 ? "in_progress" : sIdx === 1 ? "checked_in" : "confirmed") : "confirmed",
            reason: "Routine consultation and symptom assessment",
            symptoms: ["Chest tightness", "Fatigue"],
            urgencyScore: 15,
            mode: "in_person",
            fee: doc.fee,
            paymentStatus: "paid",
            paymentId: `pay_mock_${Date.now()}_${sIdx}`,
            razorpayOrderId: `order_mock_${Date.now()}_${sIdx}`,
            estimatedDelayMin: dayOffset === 0 && sIdx > 0 ? 12 : 0,
            checkInCode,
          });

          slot.appointmentId = appointment._id as any;
          await slot.save();

          await PaymentTransaction.create({
            appointmentId: appointment._id,
            patientId: bookedPatient._id,
            doctorId: doc._id,
            amount: doc.fee,
            currency: "INR",
            razorpayOrderId: appointment.razorpayOrderId,
            razorpayPaymentId: appointment.paymentId,
            razorpaySignature: "mock_signature_verified_seed",
            status: "captured",
          });

          appointmentCount++;
        }
      }
    }
  }

  // 7. Create Waitlist Entries for Dr. Arvind Mehta on fully booked Day 1
  console.log("⏳ Creating Waitlist entries for smart waitlist demo...");
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const waitlistUsers = [patients[5], patients[6], patients[7], patients[8]];
  const urgencies: Array<"urgent" | "soon" | "routine"> = ["urgent", "soon", "soon", "routine"];

  for (let i = 0; i < waitlistUsers.length; i++) {
    await WaitlistEntry.create({
      patientId: waitlistUsers[i]._id,
      doctorId: primaryDoc._id,
      dateFrom: tomorrowStr,
      dateTo: tomorrowStr,
      timeOfDay: "morning",
      urgency: urgencies[i],
      symptomNotes: `Patient triage note ${i + 1}: requesting morning cancellation priority.`,
      isFollowUp: i === 0, // patient 5 gets follow up bonus
      status: "waiting",
      declinedCount: 0,
      joinedAt: new Date(Date.now() - (4 - i) * 3600 * 1000), // joined 4h, 3h, 2h, 1h ago
    });
  }

  // 8. Create Audit Log and Notifications
  await AuditLog.create({
    actorId: adminUser._id,
    action: "DATABASE_SEEDED",
    entityType: "System",
    meta: {
      doctorsCount: createdDoctorProfiles.length,
      patientsCount: patients.length,
      appointmentsCount: appointmentCount,
    },
  });

  await Notification.create({
    userId: demoPatient._id,
    type: "WELCOME",
    title: "Welcome to CareSlot!",
    body: "Your health journey begins here. Search top doctors and manage consultations effortlessly.",
    read: false,
  });

  console.log("✅ Seed completed successfully!");
  console.log("=========================================");
  console.log("Demo Credentials:");
  console.log("👑 Admin:   admin@careslot.demo   / Admin@123");
  console.log("👨‍⚕️ Doctor:  doctor@careslot.demo  / Doctor@123");
  console.log("👥 Patient: patient@careslot.demo / Patient@123");
  console.log("=========================================");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
