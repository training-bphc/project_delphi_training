/*

Middleware for authentication and authorization.
1. There are two types of users: admin and students. Their accesses will be defined later. Get them from types/index.ts.
2. The authentication will be done using JWT tokens.
3. Google auth will be the only authentication method for all users. The admin will be automatically logged in their admin portal when logged in with google.
   ADMIN_EMAIL: training@hyderabad.bits-pilani.ac.in
   STUDENT_EMAIL: f20xxyyyy@hyderabad.bits-pilani.ac.in
4. Note that student must qualify for an eligibility criteria to access the student portal. The criteria is that the student is an on-campus (i.e. not graduated) student of BITS Pilani Hyderabad campus. This will be checked by verifying the email domain and the start year of the student. The start year should be less than or equal to the current year and greater than or equal to the current year - 5. The eligibility function is taken care in the corresponding controller.
*/

import { Request, Response, NextFunction } from 'express';
import { Student, Admin, UserRole } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {}

export const authorize = (roles: UserRole[]) => {}