ALTER TABLE `claims` ADD `isConnecting` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `claims` ADD `connectionAirport` varchar(10);--> statement-breakpoint
ALTER TABLE `claims` ADD `flight2Number` varchar(20);--> statement-breakpoint
ALTER TABLE `claims` ADD `flight2Date` timestamp;