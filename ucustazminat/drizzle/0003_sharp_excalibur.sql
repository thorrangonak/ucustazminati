CREATE TABLE `passengers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passengers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `documents` ADD `passengerId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `isRejected` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `documents` ADD `rejectedBy` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `rejectedAt` timestamp;--> statement-breakpoint
ALTER TABLE `documents` ADD `rejectionReason` text;