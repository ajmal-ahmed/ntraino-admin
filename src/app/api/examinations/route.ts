import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { parseTemplate } from '@/lib/templateParser';
import { Examination, ExaminationSummary } from '@/types/examination';

/**
 * GET /api/examinations
 * List all examinations (summary only — excludes questions array)
 */
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('examinations').orderBy('createdAt', 'desc').get();

    const examinations: ExaminationSummary[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        templateType: data.templateType,
        templateFileName: data.templateFileName,
        totalQuestions: data.totalQuestions,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return NextResponse.json({ examinations }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error listing examinations:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/examinations
 * Create a new examination with XLSX file upload.
 * Expects multipart/form-data with fields: name, description, templateType, file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const templateType = formData.get('templateType') as 'ts1' | 'ts2';
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!name || !description || !templateType || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, templateType, file' },
        { status: 400 }
      );
    }

    // Validate template type
    if (!['ts1', 'ts2'].includes(templateType)) {
      return NextResponse.json(
        { error: 'templateType must be "ts1" or "ts2"' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name;
    if (!fileName.endsWith('.xlsx')) {
      return NextResponse.json(
        { error: 'Only .xlsx files are supported' },
        { status: 400 }
      );
    }

    // Parse the XLSX file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const questions = parseTemplate(buffer, templateType);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found in the template file' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const examinationData: Omit<Examination, 'id'> = {
      name,
      description,
      templateType,
      templateFileName: fileName,
      questions,
      totalQuestions: questions.length,
      createdBy: 'system', // TODO: extract from auth token
      createdAt: now,
      updatedAt: now,
    };

    const db = getAdminDb();
    const docRef = await db.collection('examinations').add(examinationData);

    return NextResponse.json(
      {
        id: docRef.id,
        message: `Examination created successfully with ${questions.length} questions`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating examination:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
