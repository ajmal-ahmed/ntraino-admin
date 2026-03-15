import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { MockTest } from '@/types/mockTest';

/**
 * GET /api/mock-tests
 * List all mock tests (optionally filter by userId via query param)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = getAdminDb();
    let query = db.collection('mockTests').orderBy('createdAt', 'desc');

    if (userId) {
      query = db
        .collection('mockTests')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();

    const mockTests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ mockTests }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error listing mock tests:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/mock-tests
 * Start a new mock test.
 * Expects JSON body: { examinationId: string, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examinationId, userId } = body;

    if (!examinationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: examinationId, userId' },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Fetch the examination to validate it exists and get its name
    const examDoc = await db.collection('examinations').doc(examinationId).get();
    if (!examDoc.exists) {
      return NextResponse.json(
        { error: 'Examination not found' },
        { status: 404 }
      );
    }

    const examData = examDoc.data()!;
    const now = new Date().toISOString();

    const mockTestData: Omit<MockTest, 'id'> = {
      examinationId,
      examinationName: examData.name,
      userId,
      responses: [],
      totalQuestions: examData.totalQuestions,
      totalScore: examData.totalQuestions, // 1 point per question
      obtainedScore: 0,
      status: 'in-progress',
      startedAt: now,
      createdAt: now,
    };

    const docRef = await db.collection('mockTests').add(mockTestData);

    return NextResponse.json(
      {
        id: docRef.id,
        message: 'Mock test started',
        totalQuestions: examData.totalQuestions,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error starting mock test:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
