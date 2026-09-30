import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth/session';
import {
  getUserById,
  updateUser,
  addSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
} from '@/lib/auth/userStore';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('kg_session')?.value;

    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'Not logged in' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'INVALID_SESSION', message: 'Session expired' }, { status: 401 });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'USER_NOT_FOUND', message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, name, address, addressId } = body;

    let updatedUser = user;

    if (action === 'update_name' && typeof name === 'string') {
      const res = updateUser(user.id, { name: name.trim() });
      if (res) updatedUser = res;
    } else if (action === 'add_address' && address) {
      const res = addSavedAddress(user.id, address);
      if (res) updatedUser = res;
    } else if (action === 'delete_address' && addressId) {
      const res = deleteSavedAddress(user.id, addressId);
      if (res) updatedUser = res;
    } else if (action === 'set_default_address' && addressId) {
      const res = setDefaultSavedAddress(user.id, addressId);
      if (res) updatedUser = res;
    } else {
      return NextResponse.json({ success: false, error: 'INVALID_ACTION', message: 'Invalid profile update action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    console.error('profile API error:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: 'Failed to update profile' }, { status: 500 });
  }
}
