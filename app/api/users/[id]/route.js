import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// PATCH /api/users/[id]  body: { isActive?: boolean, newPassword?: string }  (admin only)
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const target = await Admin.findById(params.id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const isSelf = target._id.toString() === session.sub;

    if (typeof body.isActive === 'boolean') {
      if (isSelf) {
        return NextResponse.json({ error: "You can't change your own activation status" }, { status: 400 });
      }
      target.isActive = body.isActive;
      await target.save();
      await logAction({
        actor: session.email,
        action: body.isActive ? 'user.activate' : 'user.deactivate',
        target: target.email,
      });
    }

    if (body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      target.passwordHash = await bcrypt.hash(body.newPassword, 10);
      await target.save();
      await logAction({ actor: session.email, action: 'user.reset_password', target: target.email });
    }

    const { passwordHash, ...safeUser } = target.toObject();
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
