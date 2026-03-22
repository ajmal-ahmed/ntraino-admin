export interface Option {
  [key: string]: string; // e.g. { a: "New Delhi" }
}

export interface Question {
  id: string;
  question: string;
  options: Option[];           // [{a:"..."}, {b:"..."}, {c:"..."}, {d:"..."}]
  answer: string[];            // ["New Delhi"] — actual values
  additionalOptions?: Option[]; // TS2 only — [{a:"answer 1"}, {b:"answer 2"}, ...]
  alignment: 'right' | 'left'; // default "right", "left" for Arabic/RTL
  passage?: string;             // optional scenario/passage text
  matchColumnA?: string;        // optional "Match the Following" column A (multi-line)
  matchColumnB?: string;        // optional "Match the Following" column B (multi-line)
}

export interface Examination {
  id: string;
  name: string;
  description: string;
  templateType: 'ts1' | 'ts2';
  templateFileName: string;
  questions: Question[];
  totalQuestions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Used when listing examinations (without full questions array)
export interface ExaminationSummary {
  id: string;
  name: string;
  description: string;
  templateType: 'ts1' | 'ts2';
  templateFileName: string;
  totalQuestions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
