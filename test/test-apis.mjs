/**
 * Test script for QuizzMe APIs
 * 
 * Usage: node test/test-apis.mjs
 * 
 * Prerequisites: 
 * - The dev server must be running (npm run dev)
 * - FIREBASE_SERVICE_ACCOUNT_KEY env var must be set (or use application default credentials)
 */

import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';

// ============================================================
// 1. Generate sample XLSX files
// ============================================================

function createTS1File() {
  const data = [
    { 'Question': 'What is the capital of India?', 'option-1': 'New Delhi', 'option-2': 'Mumbai', 'option-3': 'Kolkata', 'option-4': 'Chennai', 'Answer': 'New Delhi' },
    { 'Question': 'What is 2 + 2?', 'option-1': '3', 'option-2': '4', 'option-3': '5', 'option-4': '6', 'Answer': '4' },
    { 'Question': 'Which planet is closest to the sun?', 'option-1': 'Venus', 'option-2': 'Earth', 'option-3': 'Mercury', 'option-4': 'Mars', 'Answer': 'Mercury' },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  const filePath = path.join(__dirname, 'sample_ts1.xlsx');
  XLSX.writeFile(wb, filePath);
  console.log(`✅ Created ${filePath}`);
  return filePath;
}

function createTS2File() {
  const data = [
    {
      'Question': 'Which of the following are programming languages?',
      'answer-1': 'JavaScript',
      'answer-2': 'Python',
      'answer-3': 'HTML',
      'answer-4': 'CSS',
      'option-1': 'A & B only',
      'option-2': 'A, B & C',
      'option-3': 'All of the above',
      'option-4': 'None of the above',
      'Answer': 'A & B only',
    },
    {
      'Question': 'Which of these are NoSQL databases?',
      'answer-1': 'MongoDB',
      'answer-2': 'Firestore',
      'answer-3': 'PostgreSQL',
      'answer-4': 'MySQL',
      'option-1': 'A & B only',
      'option-2': 'A, B & C',
      'option-3': 'C & D only',
      'option-4': 'All of the above',
      'Answer': 'A & B only',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  const filePath = path.join(__dirname, 'sample_ts2.xlsx');
  XLSX.writeFile(wb, filePath);
  console.log(`✅ Created ${filePath}`);
  return filePath;
}

// ============================================================
// 2. API Tests
// ============================================================

async function testCreateExamination(filePath, templateType, name) {
  console.log(`\n📋 Creating examination: ${name} (${templateType})...`);

  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', `Test examination for ${templateType} template`);
  formData.append('templateType', templateType);

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  formData.append('file', blob, path.basename(filePath));

  const res = await fetch(`${BASE_URL}/api/examinations`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function testListExaminations() {
  console.log(`\n📋 Listing examinations...`);
  const res = await fetch(`${BASE_URL}/api/examinations`);
  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Count: ${data.examinations?.length || 0}`);
  console.log(`   Examinations:`, JSON.stringify(data.examinations, null, 2));
  return data;
}

async function testGetExamination(id) {
  console.log(`\n📋 Getting examination: ${id}...`);
  const res = await fetch(`${BASE_URL}/api/examinations/${id}`);
  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Questions count: ${data.examination?.questions?.length || 0}`);
  console.log(`   First question:`, JSON.stringify(data.examination?.questions?.[0], null, 2));
  return data;
}

async function testUpdateExamination(id) {
  console.log(`\n📋 Updating examination: ${id}...`);
  const formData = new FormData();
  formData.append('name', 'Updated Exam Name');
  formData.append('description', 'Updated description');

  const res = await fetch(`${BASE_URL}/api/examinations/${id}`, {
    method: 'PUT',
    body: formData,
  });

  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function testStartMockTest(examinationId) {
  console.log(`\n🧪 Starting mock test for examination: ${examinationId}...`);
  const res = await fetch(`${BASE_URL}/api/mock-tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ examinationId, userId: 'test-user-123' }),
  });

  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function testSubmitMockTest(mockTestId, responses) {
  console.log(`\n🧪 Submitting mock test: ${mockTestId}...`);
  const res = await fetch(`${BASE_URL}/api/mock-tests/${mockTestId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  });

  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function testGetMockTest(id) {
  console.log(`\n🧪 Getting mock test: ${id}...`);
  const res = await fetch(`${BASE_URL}/api/mock-tests/${id}`);
  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Score: ${data.mockTest?.obtainedScore}/${data.mockTest?.totalScore}`);
  return data;
}

async function testDeleteExamination(id) {
  console.log(`\n🗑️  Deleting examination: ${id}...`);
  const res = await fetch(`${BASE_URL}/api/examinations/${id}`, { method: 'DELETE' });
  const data = await res.json();
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(data, null, 2));
  return data;
}

// ============================================================
// 3. Run all tests
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('QuizzMe API Tests');
  console.log('='.repeat(60));

  // Generate sample files
  const ts1File = createTS1File();
  const ts2File = createTS2File();

  try {
    // --- Examination CRUD ---
    const created = await testCreateExamination(ts1File, 'ts1', 'SSC CGL Mock 2026');
    const examId = created.id;

    await testListExaminations();
    await testGetExamination(examId);
    await testUpdateExamination(examId);

    // Also test TS2
    const created2 = await testCreateExamination(ts2File, 'ts2', 'UPSC Prelims Mock 2026');
    
    // --- Mock test lifecycle ---
    const mockTest = await testStartMockTest(examId);
    const mockTestId = mockTest.id;

    // Submit with 2 correct and 1 wrong
    await testSubmitMockTest(mockTestId, [
      { questionId: 'q1', selectedAnswer: ['New Delhi'], timeTaken: 30 },
      { questionId: 'q2', selectedAnswer: ['5'], timeTaken: 15 },       // wrong
      { questionId: 'q3', selectedAnswer: ['Mercury'], timeTaken: 20 }, // correct
    ]);

    await testGetMockTest(mockTestId);

    // --- Cleanup ---
    await testDeleteExamination(examId);
    await testDeleteExamination(created2.id);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

main();
