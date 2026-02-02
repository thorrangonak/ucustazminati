CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`claimId` int,
	`action` varchar(100) NOT NULL,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `airlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(3) NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`contactAddress` text,
	`website` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `airlines_id` PRIMARY KEY(`id`),
	CONSTRAINT `airlines_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimNumber` varchar(20) NOT NULL,
	`userId` int NOT NULL,
	`flightNumber` varchar(20) NOT NULL,
	`flightDate` timestamp NOT NULL,
	`airlineId` int,
	`departureAirport` varchar(10) NOT NULL,
	`arrivalAirport` varchar(10) NOT NULL,
	`disruptionType` enum('delay','cancellation','denied_boarding','downgrade') NOT NULL,
	`delayDuration` int,
	`passengerName` varchar(255) NOT NULL,
	`passengerEmail` varchar(320) NOT NULL,
	`passengerPhone` varchar(50),
	`bookingReference` varchar(50),
	`flightDistance` int,
	`compensationAmount` decimal(10,2),
	`commissionRate` decimal(5,2) DEFAULT '25.00',
	`commissionAmount` decimal(10,2),
	`netPayoutAmount` decimal(10,2),
	`status` enum('draft','submitted','under_review','documents_needed','sent_to_airline','airline_response','legal_action','approved','payment_pending','paid','rejected','closed') NOT NULL DEFAULT 'draft',
	`statusHistory` json,
	`internalNotes` text,
	`publicNotes` text,
	`rejectionReason` text,
	`submittedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claims_id` PRIMARY KEY(`id`),
	CONSTRAINT `claims_claimNumber_unique` UNIQUE(`claimNumber`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('boarding_pass','ticket','id_document','booking_confirmation','delay_certificate','expense_receipt','correspondence','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`extractedData` json,
	`isVerified` boolean DEFAULT false,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`claimId` int,
	`type` enum('claim_submitted','claim_status_update','document_needed','document_verified','payment_received','payment_sent','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`emailSent` boolean DEFAULT false,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('compensation','refund','expense') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`bankName` varchar(255),
	`iban` varchar(50),
	`accountHolder` varchar(255),
	`transactionId` varchar(100),
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);