CREATE TABLE `ai_diagnoses` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`symptoms` text NOT NULL,
	`suggestions` text NOT NULL,
	`alerts` text,
	`model_version` text DEFAULT '1.0.0-onnx' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`department` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`size` text NOT NULL,
	`timestamp` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `care_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`bed_number` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`prescribed_by` text NOT NULL,
	`time_scheduled` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`administered_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`chief_complaint` text NOT NULL,
	`clinical_notes` text,
	`diagnoses` text,
	`prescriptions` text,
	`lab_orders` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `current_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`token` text,
	`last_login` text
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`min_quantity` integer DEFAULT 10 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`batch_number` text,
	`expiry_date` text,
	`status` text DEFAULT 'Normal' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_code_unique` ON `inventory` (`code`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_code` text NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`insurance_name` text,
	`insurance_coverage_percent` real DEFAULT 0 NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`insurance_amount` real DEFAULT 0 NOT NULL,
	`patient_share` real DEFAULT 0 NOT NULL,
	`payment_method` text,
	`status` text DEFAULT 'Unpaid' NOT NULL,
	`paid_at` text,
	`items` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_code_unique` ON `invoices` (`invoice_code`);--> statement-breakpoint
CREATE TABLE `lab_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`request_code` text NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`test_name` text NOT NULL,
	`category` text NOT NULL,
	`requested_by` text NOT NULL,
	`date_requested` text NOT NULL,
	`status` text DEFAULT 'To Do' NOT NULL,
	`validated_by` text,
	`results` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lab_requests_request_code_unique` ON `lab_requests` (`request_code`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`action` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_code` text NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`phone` text NOT NULL,
	`address` text,
	`blood_type` text,
	`emergency_contact` text,
	`assigned_doctor` text,
	`queue_number` text,
	`arrival_time` text,
	`status` text DEFAULT 'Waiting' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_patient_code_unique` ON `patients` (`patient_code`);--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`prescription_code` text NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`items` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`dispensed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prescriptions_prescription_code_unique` ON `prescriptions` (`prescription_code`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_code` text NOT NULL,
	`supplier` text NOT NULL,
	`items` text NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`date_created` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_orders_order_code_unique` ON `purchase_orders` (`order_code`);--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text NOT NULL,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`last_login` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `vitals` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`patient_name` text NOT NULL,
	`systolic` integer NOT NULL,
	`diastolic` integer NOT NULL,
	`temperature` real NOT NULL,
	`pulse` integer NOT NULL,
	`weight` real NOT NULL,
	`sp_o2` integer NOT NULL,
	`is_abnormal` integer DEFAULT 0 NOT NULL,
	`nurse_notes` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
