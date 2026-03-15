import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { parseTemplate } from '@/lib/templateParser';
import { Examination } from '@/types/examination';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/examinations/:id
 * Get a single examination by ID (full document including questions)
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const doc = await db.collection('examinations').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Examination not found' }, { status: 404 });
    }

    const examination: Examination = {
      id: doc.id,
      ...doc.data(),
    } as Examination;

    return NextResponse.json({ examination }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error getting examination:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/examinations/:id
 * Update an examination. Can update name, description, and optionally re-upload template.
 * Expects multipart/form-data with optional fields: name, description, templateType, file
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const docRef = db.collection('examinations').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Examination not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const templateType = formData.get('templateType') as 'ts1' | 'ts2' | null;
    const file = formData.get('file') as File | null;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (description) updateData.description = description;

    // If a new template file is uploaded, re-parse it
    if (file && templateType) {
      const fileName = file.name;
      if (!fileName.endsWith('.xlsx')) {
        return NextResponse.json(
          { error: 'Only .xlsx files are supported' },
          { status: 400 }
        );
      }

      if (!['ts1', 'ts2'].includes(templateType)) {
        return NextResponse.json(
          { error: 'templateType must be "ts1" or "ts2"' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const questions = parseTemplate(buffer, templateType);

      if (questions.length === 0) {
        return NextResponse.json(
          { error: 'No valid questions found in the template file' },
          { status: 400 }
        );
      }

      updateData.templateType = templateType;
      updateData.templateFileName = fileName;
      updateData.questions = questions;
      updateData.totalQuestions = questions.length;
    }

    await docRef.update(updateData);

    return NextResponse.json(
      { message: 'Examination updated successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating examination:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/examinations/:id
 * Delete an examination by ID
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const docRef = db.collection('examinations').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Examination not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json(
      { message: 'Examination deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting examination:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
