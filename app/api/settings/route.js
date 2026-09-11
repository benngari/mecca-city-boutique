import { NextResponse } from 'next/server';
import Settings from '@/models/Settings';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { logAction } from '@/lib/audit';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await getSettings();

    if (body.defaultLowStockThresholdPiece != null) {
      settings.defaultLowStockThresholdPiece = Number(body.defaultLowStockThresholdPiece);
    }
    if (body.defaultLowStockThresholdMl != null) {
      settings.defaultLowStockThresholdMl = Number(body.defaultLowStockThresholdMl);
    }
    await settings.save();

    await logAction({
      actor: session.email,
      action: 'settings.update',
      target: 'Low stock thresholds',
      details: `Piece: ${settings.defaultLowStockThresholdPiece}, ml: ${settings.defaultLowStockThresholdMl}`,
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
