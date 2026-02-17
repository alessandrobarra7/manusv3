CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`unit_id` int,
	`action` enum('LOGIN','LOGOUT','VIEW_STUDY','OPEN_VIEWER','CREATE_REPORT','UPDATE_REPORT','SIGN_REPORT','CREATE_USER','UPDATE_USER','DELETE_USER','CREATE_UNIT','UPDATE_UNIT','DELETE_UNIT') NOT NULL,
	`target_type` varchar(50),
	`target_id` varchar(100),
	`ip_address` varchar(45),
	`user_agent` text,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_id` int NOT NULL,
	`study_id` int,
	`study_instance_uid` varchar(128),
	`template_id` int,
	`author_user_id` int NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','signed','revised') NOT NULL DEFAULT 'draft',
	`version` int NOT NULL DEFAULT 1,
	`previousVersionId` int,
	`signedAt` timestamp,
	`signedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studies_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_id` int NOT NULL,
	`orthanc_study_id` varchar(64),
	`study_instance_uid` varchar(128),
	`patient_name` varchar(255),
	`patient_id` varchar(64),
	`accession_number` varchar(64),
	`study_date` date,
	`modality` varchar(50),
	`description` text,
	`studyMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studies_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_id` int,
	`name` varchar(255) NOT NULL,
	`modality` varchar(50),
	`bodyTemplate` text NOT NULL,
	`fields` json,
	`isGlobal` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`orthanc_base_url` varchar(500),
	`orthanc_basic_user` varchar(100),
	`orthanc_basic_pass` varchar(255),
	`logoUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin_master','admin_unit','radiologist','referring_doctor') NOT NULL DEFAULT 'referring_doctor';--> statement-breakpoint
ALTER TABLE `users` ADD `unit_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;