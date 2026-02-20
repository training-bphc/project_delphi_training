-- Minimal PostgreSQL schema for SAMPLETESTDATA table
-- Drops table if it exists
DROP TABLE IF EXISTS SAMPLETESTDATA;

-- Creates SAMPLETESTDATA table with required keys
CREATE TABLE SAMPLETESTDATA (
    S_no SERIAL PRIMARY KEY, -- Auto-incrementing serial number
    name VARCHAR(100) NOT NULL,
    bits_id VARCHAR(20) UNIQUE NOT NULL,
    email_id VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    added_by VARCHAR(50) NOT NULL,
    verification_status VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL
);

-- Sample insert (edit or add more as needed)
INSERT INTO SAMPLETESTDATA (name, bits_id, email_id, date, category, added_by, verification_status, points) VALUES
('Viswa Somayajula', '20240546', 'f20240546@bits-pilani.ac.in', '01-01-2026', 'Hackathon', 'Student', 'Pending', 0);
('Vedant Barve', '20231100', 'f20231100@bits-pilani.ac.in', '01-02-2026', 'Lecture Session ', 'Training Unit', 'Verified', 7);
('Madhav', '20230046', 'f20230046@bits-pilani.ac.in', '20-02-2026', 'Workshop', 'Training Unit', 'Pending', 0);
('Siddharth', '20231106', 'f20231106@bits-pilani.ac.in', '21-02-2026', 'Seminar', 'Training Unit', 'Pending', 0);

