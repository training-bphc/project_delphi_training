-- Sample PostgreSQL schema and data for Training Points project

-- Drop tables if they exist
DROP TABLE IF EXISTS student_requests;
DROP TABLE IF EXISTS users;

-- Users table (for admins, TU, students)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    bits_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL -- e.g., 'student', 'admin', 'tu'
);

-- Student requests table
CREATE TABLE student_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    added_by VARCHAR(50) NOT NULL,
    verified_status VARCHAR(20) NOT NULL, -- e.g., 'Pending', 'Rejected', 'Accepted'
    details TEXT
);

-- Sample users
INSERT INTO users (bits_id, name, email, role) VALUES
('20240546', 'Viswa Somayajula', 'f20240546@bits-pilani.ac.in', 'student'),
('20231100', 'Vedant Barve', 'f20231100@bits-pilani.ac.in', 'student'),
('20230046', 'Madhav', 'f20230046@bits-pilani.ac.in', 'student'),
('20231106', 'Siddharth', 'f20231106@bits-pilani.ac.in', 'student');

-- Sample student requests
INSERT INTO student_requests (student_id, category, date, added_by, verified_status, details) VALUES
(1, 'Hackathon', '2026-01-01', 'Student', 'No', 'Participated in hackathon.'),
(2, 'Lecture Session', '2026-02-01', 'Training Unit', 'Yes', 'Attended lecture session.'),
(3, 'Workshop', '2026-02-20', 'Admin', 'Yes', 'Completed workshop.'),
(4, 'Seminar', '2026-02-21', 'Admin', 'No', 'Attended seminar.');
