ALTER TABLE `documents` MODIFY COLUMN `type` enum('boarding_pass','ticket','id_document','id_card','passport','booking_confirmation','delay_certificate','expense_receipt','correspondence','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `claims` ADD `consentSignature` text;--> statement-breakpoint
ALTER TABLE `claims` ADD `consentSignedAt` timestamp;--> statement-breakpoint
ALTER TABLE `claims` ADD `consentIpAddress` varchar(45);