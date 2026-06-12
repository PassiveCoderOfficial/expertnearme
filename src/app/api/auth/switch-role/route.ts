import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

const STAFF_ROLES = ["MANAGER", "MARKETER", "SEO_EXPERT", "SALES_AGENT", "ADMIN", "SUPER_ADMIN"];

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("token="));

    if (!match) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const token = match.split("=")[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { role: targetRole } = await req.json();
    if (!targetRole) {
      return NextResponse.json({ ok: false, error: "Missing role" }, { status: 400 });
    }

    // Staff roles cannot be switched to by non-staff (only admin can assign staff roles)
    const isStaffRole = STAFF_ROLES.includes(targetRole);
    const userHasRole = user.roles.includes(targetRole);

    if (!userHasRole) {
      // Auto-grant BUYER/EXPERT/SALES_AGENT on first switch — user earns that context
      const grantableRoles = ["BUYER", "EXPERT", "SALES_AGENT"];
      if (!grantableRoles.includes(targetRole)) {
        return NextResponse.json({ ok: false, error: "Role not available" }, { status: 403 });
      }
      if (isStaffRole) {
        return NextResponse.json({ ok: false, error: "Role not available" }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          activeRole: targetRole,
          role: targetRole,
          roles: { push: targetRole },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeRole: targetRole, role: targetRole },
      });
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!updatedUser) {
      return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
    }

    const newToken = jwt.sign(
      {
        userId: updatedUser.id,
        role: updatedUser.activeRole,
        activeRole: updatedUser.activeRole,
        roles: updatedUser.roles,
        email: updatedUser.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      ok: true,
      activeRole: updatedUser.activeRole,
      roles: updatedUser.roles,
    });

    res.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set({
      name: "role",
      value: updatedUser.activeRole,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("switch-role error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
