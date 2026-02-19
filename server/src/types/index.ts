// USERS

export type UserRole = 'student' | 'admin';

export interface Student {
  student_id:   number;   // internal DB surrogate key — do NOT expose in API responses
  roll_number:  string;   // real student identity e.g. "F20210001"
  student_name: string;
  email:        string;
  start_year:   number;
  end_year:     number;
}

export interface Admin {
  admin_id:   number;     // internal DB surrogate key
  admin_name: string;
  email:      string;
}


// JWT PAYLOAD

export interface JwtPayload {
  id:    string;   // roll_number for students; email for admins
  email: string;
  role:  UserRole;
  iat:   number;   // issued at (set automatically by jsonwebtoken)
  exp:   number;   // expiration time (set automatically by jsonwebtoken)
}
