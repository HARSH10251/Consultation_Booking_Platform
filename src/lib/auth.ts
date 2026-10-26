import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, UserRole, UserStatus } from "@/server/models/User";
import { DoctorProfile } from "@/server/models/DoctorProfile";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  doctorId?: string;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    doctorId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    doctorId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "mock_nextauth_secret_key_change_this_min_32_chars_long_xyz123",
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        let doctorId: string | undefined;
        if (user.role === "doctor") {
          const profile = await DoctorProfile.findOne({ userId: user._id });
          if (profile) {
            doctorId = profile._id.toString();
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.status,
          doctorId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.doctorId = token.doctorId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
