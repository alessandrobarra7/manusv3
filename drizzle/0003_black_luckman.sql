ALTER TABLE `units` ADD `pacs_ip` varchar(45);--> statement-breakpoint
ALTER TABLE `units` ADD `pacs_port` int;--> statement-breakpoint
ALTER TABLE `units` ADD `pacs_ae_title` varchar(16);--> statement-breakpoint
ALTER TABLE `units` ADD `pacs_local_ae_title` varchar(16) DEFAULT 'PACSMANUS';