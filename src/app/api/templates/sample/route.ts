import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/**
 * GET /api/templates/sample?type=ts1|ts2
 * Generate and download a sample XLSX template file
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'ts1';

  if (!['ts1', 'ts2'].includes(type)) {
    return NextResponse.json({ error: 'type must be "ts1" or "ts2"' }, { status: 400 });
  }

  let data: Record<string, string>[];
  let fileName: string;

  if (type === 'ts1') {
    fileName = 'sample_template_ts1.xlsx';
    data = [
      {
        'Question': 'What is the capital of India?',
        'option-1': 'New Delhi',
        'option-2': 'Mumbai',
        'option-3': 'Kolkata',
        'option-4': 'Chennai',
        'Answer': 'New Delhi',
      },
      {
        'Question': 'What is 2 + 2?',
        'option-1': '3',
        'option-2': '4',
        'option-3': '5',
        'option-4': '6',
        'Answer': '4',
      },
      {
        'Question': 'Which planet is closest to the sun?',
        'option-1': 'Venus',
        'option-2': 'Earth',
        'option-3': 'Mercury',
        'option-4': 'Mars',
        'Answer': 'Mercury',
      },
    ];
  } else {
    fileName = 'sample_template_ts2.xlsx';
    data = [
      {
        'Question': 'Which of the following are programming languages?',
        'answer-1': 'JavaScript is a programming language',
        'answer-2': 'Python is a programming language',
        'answer-3': 'HTML is a markup language',
        'answer-4': 'CSS is a styling language',
        'option-1': 'A & B only',
        'option-2': 'A, B & C',
        'option-3': 'All of the above',
        'option-4': 'None of the above',
        'Answer': 'A & B only',
      },
      {
        'Question': 'Which of these are NoSQL databases?',
        'answer-1': 'MongoDB is a document database',
        'answer-2': 'Firestore is a cloud NoSQL database',
        'answer-3': 'PostgreSQL is a relational database',
        'answer-4': 'MySQL is a relational database',
        'option-1': 'A & B only',
        'option-2': 'A, B & C',
        'option-3': 'C & D only',
        'option-4': 'All of the above',
        'Answer': 'A & B only',
      },
    ];
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns for readability
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => (row[key] || '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
