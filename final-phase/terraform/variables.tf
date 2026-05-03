variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base project name used in resource naming"
  type        = string
  default     = "shopsmart"
}

variable "environment" {
  description = "Environment label"
  type        = string
  default     = "final"
}

variable "s3_bucket_prefix" {
  description = "Prefix for the rubric-compliant S3 bucket (unique suffix is added automatically)"
  type        = string
  default     = "shopsmart-final-artifacts"
}

variable "container_port" {
  description = "Container port exposed by the application"
  type        = number
  default     = 5001
}

variable "desired_count" {
  description = "Desired ECS task count"
  type        = number
  default     = 1
}

variable "ecs_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Fargate task memory (MiB)"
  type        = number
  default     = 512
}

variable "vpc_id" {
  description = "Optional VPC ID. Leave empty to use default VPC"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "Optional list of subnet IDs. Leave empty to use default VPC subnets"
  type        = list(string)
  default     = []
}

variable "assign_public_ip" {
  description = "Assign public IP to Fargate tasks"
  type        = bool
  default     = true
}

variable "database_url" {
  description = "DATABASE_URL injected into ECS task"
  type        = string
  default     = "file:./dev.db"
}

variable "deploy_ecs_service" {
  description = "When true, Terraform also creates ECS task definition + service"
  type        = bool
  default     = false
}

variable "container_image" {
  description = "Container image URI (ECR). Required when deploy_ecs_service=true"
  type        = string
  default     = ""
}

variable "ecs_execution_role_arn" {
  description = "Existing execution role ARN (Lab role compatible). No IAM role is created by Terraform"
  type        = string
  default     = ""
}

variable "ecs_task_role_arn" {
  description = "Optional existing task role ARN. No IAM role is created by Terraform"
  type        = string
  default     = ""
}
