import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/mock-tests/:id
 * Get mock test details including responses and score
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const doc = await db.collection('mockTests').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Mock test not found' }, { status: 404 });
    }

    const mockTest = {
      id: doc.id,
      ...doc.data(),
    };

    return NextResponse.json({ mockTest }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error getting mock test:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
