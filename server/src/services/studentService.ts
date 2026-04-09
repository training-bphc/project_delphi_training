import { parse } from "csv-parse/sync";
import { Student, SectorType } from "../types";
import {
  StudentInsertPayload,
  insertBulkStudents,
  validateEmailUniqueness,
} from "../repositories/studentRepository";

const VALID_SECTORS: SectorType[] = ["IT", "ET", "Core", "FinTech"];
const MIN_CGPA = 0;
const MAX_CGPA = 10;

export interface BulkInsertResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email?: string; error: string }>;
  students: Student[];
}

interface ParsedRecord {
  email?: string;
  student_name?: string;
  roll_number?: string;
  start_year?: string;
  end_year?: string;
  cgpa?: string;
  sector?: string;
  [key: string]: string | undefined;
}

/**
 * Parse CSV content into an array of records
 */
export const parseCsv = (csvContent: string): ParsedRecord[] => {
  try {
    const records = parse(csvContent, {
      columns: true, // Use first row as column headers
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (error) {
    throw new Error(
      `CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Validate a single student record
 * Returns error message if validation fails, null if valid
 */
const validateStudentRecord = (
  record: ParsedRecord,
  rowIndex: number,
): { valid: true; student: StudentInsertPayload } | { valid: false; error: string } => {
  const requiredFields = [
    "email",
    "student_name",
    "roll_number",
    "start_year",
    "end_year",
    "cgpa",
    "sector",
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!record[field] || record[field]?.trim() === "") {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  const email = record.email!.trim();
  const studentName = record.student_name!.trim();
  const rollNumber = record.roll_number!.trim();
  const cgpaStr = record.cgpa!.trim();
  const sector = record.sector!.trim() as SectorType;
  const startYearStr = record.start_year!.trim();
  const endYearStr = record.end_year!.trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: `Invalid email format: ${email}` };
  }

  // Validate start_year and end_year are numbers
  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);

  if (isNaN(startYear) || startYear < 1900 || startYear > 2100) {
    return { valid: false, error: `Invalid start_year: ${startYearStr}` };
  }

  if (isNaN(endYear) || endYear < 1900 || endYear > 2100) {
    return { valid: false, error: `Invalid end_year: ${endYearStr}` };
  }

  if (startYear > endYear) {
    return {
      valid: false,
      error: `start_year (${startYear}) cannot be greater than end_year (${endYear})`,
    };
  }

  // Validate CGPA is a number between 0 and 10
  const cgpa = parseFloat(cgpaStr);

  if (isNaN(cgpa)) {
    return { valid: false, error: `CGPA must be a number, got: ${cgpaStr}` };
  }

  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return {
      valid: false,
      error: `CGPA must be between ${MIN_CGPA} and ${MAX_CGPA}, got: ${cgpa}`,
    };
  }

  // Validate sector is in allowed values
  if (!VALID_SECTORS.includes(sector)) {
    return {
      valid: false,
      error: `Sector must be one of: ${VALID_SECTORS.join(", ")}, got: ${sector}`,
    };
  }

  // Validate roll_number format (basic check)
  if (rollNumber.length < 3) {
    return { valid: false, error: `Roll number too short: ${rollNumber}` };
  }

  return {
    valid: true,
    student: {
      email,
      student_name: studentName,
      roll_number: rollNumber,
      start_year: startYear,
      end_year: endYear,
      cgpa,
      sector,
    },
  };
};

/**
 * Validate all student records
 * Returns array of valid records and array of errors
 * Also detects duplicate emails within the CSV itself
 */
export const validateRecords = (
  records: ParsedRecord[],
): {
  validRecords: StudentInsertPayload[];
  errors: Array<{ row: number; email?: string; error: string }>;
} => {
  const validRecords: StudentInsertPayload[] = [];
  const errors: Array<{ row: number; email?: string; error: string }> = [];
  const seenEmails = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const rowNumber = i + 2; // +2 because rows are 1-indexed and header is row 1
    const record = records[i];
    const validation = validateStudentRecord(record, rowNumber);

    if (!validation.valid) {
      errors.push({
        row: rowNumber,
        email: record.email,
        error: validation.error,
      });
    } else {
      const normalizedEmail = validation.student.email.toLowerCase();
      if (seenEmails.has(normalizedEmail)) {
        errors.push({
          row: rowNumber,
          email: validation.student.email,
          error: `Duplicate email in CSV: ${validation.student.email}`,
        });
      } else {
        seenEmails.add(normalizedEmail);
        validRecords.push(validation.student);
      }
    }
  }

  return { validRecords, errors };
};

/**
 * Bulk insert students with comprehensive validation
 * Checks for duplicate emails before insertion
 */
export const bulkInsertStudents = async (
  csvContent: string,
): Promise<BulkInsertResult> => {
  const errors: Array<{ row: number; email?: string; error: string }> = [];
  let parsedRecords: ParsedRecord[] = [];

  // Step 1: Parse CSV
  try {
    parsedRecords = parseCsv(csvContent);

    if (parsedRecords.length === 0) {
      return {
        success: 0,
        failed: 0,
        errors: [{ row: 0, error: "CSV file is empty" }],
        students: [],
      };
    }
  } catch (error) {
    return {
      success: 0,
      failed: 0,
      errors: [
        {
          row: 0,
          error: error instanceof Error ? error.message : "CSV parsing failed",
        },
      ],
      students: [],
    };
  }

  // Step 2: Validate records
  const { validRecords, errors: validationErrors } = validateRecords(parsedRecords);
  errors.push(...validationErrors);

  if (validRecords.length === 0) {
    return {
      success: 0,
      failed: errors.length,
      errors,
      students: [],
    };
  }

  // Step 3: Check for duplicate emails in the database
  const emails = validRecords.map((r) => r.email);
  const existingEmailsList = await validateEmailUniqueness(emails);
  const existingEmailsSet = new Set(existingEmailsList.map((e) => e.toLowerCase()));

  const duplicateErrors = validRecords
    .filter((record) => existingEmailsSet.has(record.email.toLowerCase()))
    .map((record) => ({
      row:
        parsedRecords.findIndex(
          (r) => r.email?.toLowerCase() === record.email.toLowerCase(),
        ) + 2,
      email: record.email,
      error: `Email already exists in database: ${record.email}`,
    }));

  errors.push(...duplicateErrors);

  // Filter out records with duplicate emails
  const recordsToInsert = validRecords.filter(
    (record) => !existingEmailsSet.has(record.email.toLowerCase()),
  );

  if (recordsToInsert.length === 0) {
    return {
      success: 0,
      failed: errors.length,
      errors,
      students: [],
    };
  }

  // Step 4: Insert into database
  try {
    const insertedStudents = await insertBulkStudents(recordsToInsert);

    return {
      success: insertedStudents.length,
      failed: errors.length,
      errors,
      students: insertedStudents,
    };
  } catch (error) {
    return {
      success: 0,
      failed: errors.length + recordsToInsert.length,
      errors: [
        ...errors,
        {
          row: 0,
          error: `Database insertion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      students: [],
    };
  }
};
