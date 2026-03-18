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
        'alignment': '',
        'passage': 'Read the following and answer the question:\nIndia is a country in South Asia with New Delhi as its capital.',
      },
      {
        'Question': 'What is 2 + 2?',
        'option-1': '3',
        'option-2': '4',
        'option-3': '5',
        'option-4': '6',
        'Answer': '4',
        'alignment': '',
        'passage': '',
      },
      {
        'Question': '\u0645\u0627 \u0647\u064A \u0639\u0627\u0635\u0645\u0629 \u0645\u0635\u0631\u061F',
        'option-1': '\u0627\u0644\u0642\u0627\u0647\u0631\u0629',
        'option-2': '\u0627\u0644\u0625\u0633\u0643\u0646\u062F\u0631\u064A\u0629',
        'option-3': '\u0627\u0644\u062C\u064A\u0632\u0629',
        'option-4': '\u0623\u0633\u0648\u0627\u0646',
        'Answer': '\u0627\u0644\u0642\u0627\u0647\u0631\u0629',
        'alignment': 'left',
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
        'alignment': '',
        'passage': 'Consider the following technologies and how they are used in web development.',
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
        'alignment': '',
        'passage': '',
      },
      {
        'Question': 'What is the largest ocean on Earth?',
        'answer-1': '',
        'answer-2': '',
        'answer-3': '',
        'answer-4': '',
        'option-1': 'Atlantic Ocean',
        'option-2': 'Pacific Ocean',
        'option-3': 'Indian Ocean',
        'option-4': 'Arctic Ocean',
        'Answer': 'Pacific Ocean',
        'alignment': '',
      },
      {
        'Question': '\u0645\u0627 \u0647\u064A \u0639\u0627\u0635\u0645\u0629 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F',
        'answer-1': '\u0627\u0644\u0631\u064A\u0627\u0636 \u0647\u064A \u0627\u0644\u0639\u0627\u0635\u0645\u0629',
        'answer-2': '\u062C\u062F\u0629 \u0645\u062F\u064A\u0646\u0629 \u0633\u0627\u062D\u0644\u064A\u0629',
        'answer-3': '\u0645\u0643\u0629 \u0645\u062F\u064A\u0646\u0629 \u0645\u0642\u062F\u0633\u0629',
        'answer-4': '\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0645\u062F\u064A\u0646\u0629 \u0645\u0642\u062F\u0633\u0629',
        'option-1': '\u0623 \u0641\u0642\u0637',
        'option-2': '\u0623 \u0648 \u0628',
        'option-3': '\u062C\u0645\u064A\u0639 \u0645\u0627 \u0633\u0628\u0642',
        'option-4': '\u0644\u0627 \u0634\u064A\u0621 \u0645\u0645\u0627 \u0633\u0628\u0642',
        'Answer': '\u0623 \u0641\u0642\u0637',
        'alignment': 'left',
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
