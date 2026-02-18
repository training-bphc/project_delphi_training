/*
Type Definitions
 Contains all TypeScript interfaces and types for:
 - Database entity models (matching the ER diagram)
 - Authentication and JWT payloads
 - API response structures
 - Query and filter helpers
*/


// USERS

export type UserRole = 'student' | 'admin';

export interface Student {
  student_id: string;
  student_name: string;
  start_year: number;
  end_year: number;
}

export interface Admin {
  admin_id: string;
  admin_name: string;
}


// JWT PAYLOAD

export interface JwtPayload {
  id: number; // student_id or admin_id
  email: string;
  role: UserRole;
  iat: number; // issued at
  exp: number; // expiration time
}