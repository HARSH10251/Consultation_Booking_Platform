import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const registerDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  specialtyId: z.string().min(1, "Specialty is required"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  experienceYears: z.number().min(0, "Experience must be 0 or more years"),
  fee: z.number().min(100, "Consultation fee must be at least ₹100"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  assignedRoomId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type RegisterDoctorInput = z.infer<typeof registerDoctorSchema>;
