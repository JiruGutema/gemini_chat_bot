-- create a database called jirenIntelli for user and history management
create database jirenIntelli;

-- using the database which just created
use jirenIntelli;

-- create a user table to track the users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT * FROM history;