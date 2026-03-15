import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { MockTestResponse } from '@/types/mockTest';
import { Question } from '@/types/examination';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/mock-tests/:id/submit
 * Submit completed test responses and calculate score.
 *
 * Expects JSON body:
 * {
 *   responses: [
 *     { questionId: "q1", selectedAnswer: ["New Delhi"], timeTaken: 45 },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { responses } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Missing required field: responses (array)' },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Fetch the mock test
    const mockTestDoc = await db.collection('mockTests').doc(id).get();
    if (!mockTestDoc.exists) {
      return NextResponse.json({ error: 'Mock test not found' }, { status: 404 });
    }

    const mockTestData = mockTestDoc.data()!;

    // Check if already completed
    if (mockTestData.status === 'completed') {
      return NextResponse.json(
        { error: 'This mock test has already been submitted' },
        { status: 400 }
      );
    }

    // Fetch the examination to get correct answers
    const examDoc = await db
      .collection('examinations')
      .doc(mockTestData.examinationId)
      .get();

    if (!examDoc.exists) {
      return NextResponse.json(
        { error: 'Associated examination not found' },
        { status: 500 }
      );
    }

    const examData = examDoc.data()!;
    const questions: Question[] = examData.questions;

    // Build a map of questionId -> correct answer
    const answerMap = new Map<string, string[]>();
    for (const q of questions) {
      answerMap.set(q.id, q.answer);
    }

    // Evaluate each response
    let obtainedScore = 0;
    const evaluatedResponses: MockTestResponse[] = responses.map(
      (resp: { questionId: string; selectedAnswer: string[]; timeTaken: number }) => {
        const correctAnswer = answerMap.get(resp.questionId);
        const isCorrect = arraysEqual(resp.selectedAnswer, correctAnswer || []);

        if (isCorrect) {
          obtainedScore += 1;
        }

        return {
          questionId: resp.questionId,
          selectedAnswer: resp.selectedAnswer,
          isCorrect,
          timeTaken: resp.timeTaken || 0,
        };
      }
    );

    const now = new Date().toISOString();

    // Update the mock test document
    await db.collection('mockTests').doc(id).update({
      responses: evaluatedResponses,
      obtainedScore,
      status: 'completed',
      completedAt: now,
    });

    return NextResponse.json(
      {
        message: 'Mock test submitted successfully',
        totalQuestions: mockTestData.totalQuestions,
        totalScore: mockTestData.totalScore,
        obtainedScore,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error submitting mock test:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Compare two string arrays for equality (order-independent for multi-answer support)
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}
