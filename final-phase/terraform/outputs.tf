output "stack_name" {
  description = "Unique stack name prefix used by ECS/ECR/log/SG resources"
  value       = local.stack_name
}

output "s3_bucket_name" {
  description = "Rubric S3 bucket name"
  value       = aws_s3_bucket.rubric_bucket.bucket
}

output "ecr_repository_url" {
  description = "ECR repository URL for image push"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  description = "ECS service name (null until deploy_ecs_service=true)"
  value       = try(aws_ecs_service.app[0].name, null)
}

output "ecs_security_group_id" {
  description = "Security group attached to ECS tasks"
  value       = aws_security_group.ecs_service.id
}

output "selected_subnet_ids" {
  description = "Subnets used by ECS tasks"
  value       = local.selected_subnet_ids
}
