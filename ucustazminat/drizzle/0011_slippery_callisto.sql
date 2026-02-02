ALTER TABLE `users` ADD `resetPasswordToken` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `resetPasswordExpires` timestamp;