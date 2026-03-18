import * as XLSX from 'xlsx';
import { Question, Option } from '@/types/examination';

/**
 * Parse an XLSX template file into an array of Question objects.
 *
 * TS1 columns: Question, option-1, option-2, option-3, option-4, Answer [, alignment] [, passage]
 * TS2 columns: Question, answer-1, answer-2, answer-3, answer-4, option-1, option-2, option-3, option-4, Answer [, alignment] [, passage]
 *
 * alignment column is optional — defaults to "right", stores "left" only when explicitly set.
 * passage column is optional — omitted from question data if empty.
 * TS2: if all answer-1..4 are empty, additionalOptions is omitted.
 */
export function parseTemplate(
  buffer: Buffer,
  templateType: 'ts1' | 'ts2'
): Question[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Read from the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Template file has no sheets');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
  });

  if (rows.length === 0) {
    throw new Error('Template file has no data rows');
  }

  if (templateType === 'ts1') {
    return parseTS1(rows);
  } else {
    return parseTS2(rows);
  }
}

/**
 * Read the alignment column — returns "left" only if explicitly set, otherwise "right".
 */
function getAlignment(row: Record<string, string>): 'right' | 'left' {
  const value = getColumn(row, 'alignment').toLowerCase();
  return value === 'left' ? 'left' : 'right';
}

/**
 * TS1 format:
 * Question | option-1 | option-2 | option-3 | option-4 | Answer [| alignment]
 */
function parseTS1(rows: Record<string, string>[]): Question[] {
  return rows.map((row, index) => {
    const question = getColumn(row, 'Question');
    const opt1 = getColumn(row, 'option-1');
    const opt2 = getColumn(row, 'option-2');
    const opt3 = getColumn(row, 'option-3');
    const opt4 = getColumn(row, 'option-4');
    const answer = getColumn(row, 'Answer');
    const passage = getColumn(row, 'passage');

    if (!question) {
      throw new Error(`Row ${index + 2}: "Question" column is empty`);
    }

    const options: Option[] = [
      { a: opt1 },
      { b: opt2 },
      { c: opt3 },
      { d: opt4 },
    ];

    const result: Question = {
      id: `q${index + 1}`,
      question,
      options,
      answer: [answer],
      alignment: getAlignment(row),
    };

    if (passage) {
      result.passage = passage;
    }

    return result;
  });
}

/**
 * TS2 format:
 * Question | answer-1 | answer-2 | answer-3 | answer-4 | option-1 | option-2 | option-3 | option-4 | Answer [| alignment]
 *
 * additionalOptions = answer-1..4 (context rendered before options)
 * options = option-1..4 (the selectable choices, e.g. "A & B", "Only C", etc.)
 *
 * If all answer-1..4 are empty, additionalOptions is omitted entirely.
 */
function parseTS2(rows: Record<string, string>[]): Question[] {
  return rows.map((row, index) => {
    const question = getColumn(row, 'Question');
    const ans1 = getColumn(row, 'answer-1');
    const ans2 = getColumn(row, 'answer-2');
    const ans3 = getColumn(row, 'answer-3');
    const ans4 = getColumn(row, 'answer-4');
    const opt1 = getColumn(row, 'option-1');
    const opt2 = getColumn(row, 'option-2');
    const opt3 = getColumn(row, 'option-3');
    const opt4 = getColumn(row, 'option-4');
    const answer = getColumn(row, 'Answer');
    const passage = getColumn(row, 'passage');

    if (!question) {
      throw new Error(`Row ${index + 2}: "Question" column is empty`);
    }

    const options: Option[] = [
      { a: opt1 },
      { b: opt2 },
      { c: opt3 },
      { d: opt4 },
    ];

    const result: Question = {
      id: `q${index + 1}`,
      question,
      options,
      answer: [answer],
      alignment: getAlignment(row),
    };

    // Only include additionalOptions if at least one answer column has data.
    // Also skip any individual statement columns that are empty so they are not rendered.
    const additionalOptionEntries = [
      { key: 'a', value: ans1 },
      { key: 'b', value: ans2 },
      { key: 'c', value: ans3 },
      { key: 'd', value: ans4 },
    ].filter((entry) => entry.value !== '');

    if (additionalOptionEntries.length > 0) {
      result.additionalOptions = additionalOptionEntries.map((entry) => ({
        [entry.key]: entry.value,
      }));
    }

    if (passage) {
      result.passage = passage;
    }

    return result;
  });
}

/**
 * Case-insensitive column lookup — handles variations in header names.
 */
function getColumn(row: Record<string, string>, columnName: string): string {
  // Try exact match first
  if (row[columnName] !== undefined) {
    return String(row[columnName]).trim();
  }

  // Try case-insensitive match
  const lowerTarget = columnName.toLowerCase();
  for (const key of Object.keys(row)) {
    if (key.toLowerCase().trim() === lowerTarget) {
      return String(row[key]).trim();
    }
  }

  return '';
}
