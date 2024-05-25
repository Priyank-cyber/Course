-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2024 at 09:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `course`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `courseCode` varchar(255) NOT NULL,
  `courseName` varchar(255) NOT NULL,
  `credits` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `courseCode`, `courseName`, `credits`) VALUES
(1, '7302', 'Cyber Security Fundamentals', 6),
(2, 'C73490', 'Cyber Security Concepts', 6),
(3, 'C1234', 'Intro to Cyber Security', 3);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `role` varchar(200) NOT NULL DEFAULT 'user',
  `password` varchar(255) NOT NULL,
  `login_attempts` int(11) DEFAULT 3,
  `confirmation_token` mediumtext NOT NULL,
  `account_status` varchar(10) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `email`, `mobile`, `role`, `password`, `login_attempts`, `confirmation_token`, `account_status`) VALUES
(4, 'Gal Gadot', 'gal@gmail.com', '0412805908', 'admin', '$2b$10$i6uwCBGMF/Zj/7JpAjMzSu86E35vWfvlS3JhWhBZqARewHyJldphC', 3, '', 'active'),
(5, 'Priyank Vachhani', 'priyank@gmail.com', '1234098765', 'user', '$2b$10$sVtVodgNLsalOXHnQU6ZjOBkocdU/aR/vNfY6qE8Otq1lThD4t7sW', 3, '', 'active'),
(6, 'Shreya', 'shreya@gmail.com', '0431256782', 'user', '$2b$10$bvmq/24BBh8QNsuw30Fa3.9ajs0GloU5Czx43S451jrrugc7tagYm', 0, '', 'active'),
(7, 'Shanice', 'shanice@gmail.com', '0412345678', 'admin', '$2b$10$xBzhmXLzYPA.MkrWTfgqjesRhMf6tBk168Ij39RzDfJ23Mo.s69MC', 3, '', 'active'),
(12, 'Harsh', 'mehtaharshaus@gmail.com', '0123456777', 'user', '$2b$10$fsn9W4yd5ApXpGogalT08uTsaEdztYZbrprtae/MYZMadBjt2/8Zm', 3, '1771725fe7aee165049f968a4921aec6231ddd30', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `user_courses`
--

CREATE TABLE `user_courses` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_courses`
--

INSERT INTO `user_courses` (`id`, `userId`, `courseId`) VALUES
(1, 5, 1),
(2, 6, 3),
(3, 12, 1),
(4, 12, 2),
(5, 12, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_courses`
--
ALTER TABLE `user_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`,`courseId`),
  ADD KEY `courseId` (`courseId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_courses`
--
ALTER TABLE `user_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_courses`
--
ALTER TABLE `user_courses`
  ADD CONSTRAINT `user_courses_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_courses_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
