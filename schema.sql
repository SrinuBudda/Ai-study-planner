-- AI Study Planner Database Schema

CREATE DATABASE IF NOT EXISTS ai_study_planner;
USE ai_study_planner;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Exam Dates Table
CREATE TABLE IF NOT EXISTS exam_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_key VARCHAR(50) NOT NULL,
  exam_date DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_exam (user_id, exam_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Syllabus Topics Table
CREATE TABLE IF NOT EXISTS syllabus_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_key VARCHAR(50) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  topic_name VARCHAR(150) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_topic (user_id, exam_key, subject_name, topic_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_key VARCHAR(50) NOT NULL,
  day_index INT NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(150) NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_key VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_note (user_id, exam_key, subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Chatbot Logs Table
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_key VARCHAR(50) NOT NULL,
  sender VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Previous Year Papers Table (PYQs)
CREATE TABLE IF NOT EXISTS pyq_papers (
  id VARCHAR(100) PRIMARY KEY,
  exam_key VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  year INT NOT NULL,
  file_size VARCHAR(20) NOT NULL,
  downloads INT DEFAULT 0,
  file_url VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
