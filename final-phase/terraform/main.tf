locals {
  name_prefix         = "${var.project_name}-${var.environment}"
  stack_name          = "${local.name_prefix}-${random_string.stack_suffix.result}"
  selected_vpc_id     = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.default[0].id
  selected_subnet_ids = length(var.subnet_ids) > 0 ? var.subnet_ids : data.aws_subnets.default[0].ids

  create_ecs_service = (
    var.deploy_ecs_service &&
    var.container_image != "" &&
    var.ecs_execution_role_arn != ""
  )
}

data "aws_vpc" "default" {
  count   = var.vpc_id == "" ? 1 : 0
  default = true
}

data "aws_subnets" "default" {
  count = length(var.subnet_ids) == 0 ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [local.selected_vpc_id]
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  upper   = false
  special = false
}

resource "random_string" "stack_suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "aws_s3_bucket" "rubric_bucket" {
  bucket        = "${var.s3_bucket_prefix}-${random_string.bucket_suffix.result}"
  force_destroy = true

  tags = {
    Name        = "${local.stack_name}-bucket"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "rubric_bucket_versioning" {
  bucket = aws_s3_bucket.rubric_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rubric_bucket_encryption" {
  bucket = aws_s3_bucket.rubric_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "rubric_bucket_public_block" {
  bucket = aws_s3_bucket.rubric_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_ecr_repository" "app" {
  name                 = "${local.stack_name}-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${local.stack_name}-repo"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_cluster" "app" {
  name = "${local.stack_name}-cluster"

  tags = {
    Name        = "${local.stack_name}-cluster"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.stack_name}"
  retention_in_days = 7

  tags = {
    Name        = "${local.stack_name}-logs"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "ecs_service" {
  name        = "${local.stack_name}-ecs-sg"
  description = "Allow app traffic to ECS task"
  vpc_id      = local.selected_vpc_id

  ingress {
    description = "App traffic"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${local.stack_name}-ecs-sg"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_task_definition" "app" {
  count = local.create_ecs_service ? 1 : 0

  family                   = "${local.stack_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.ecs_cpu)
  memory                   = tostring(var.ecs_memory)
  execution_role_arn       = var.ecs_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn != "" ? var.ecs_task_role_arn : null

  container_definitions = jsonencode([
    {
      name      = "shopsmart-server"
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = tostring(var.container_port)
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 20
      }
    }
  ])

  tags = {
    Name        = "${local.stack_name}-task"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_service" "app" {
  count = local.create_ecs_service ? 1 : 0

  name            = "${local.stack_name}-service"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app[0].arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = local.selected_subnet_ids
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = var.assign_public_ip
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  depends_on = [aws_cloudwatch_log_group.app]

  tags = {
    Name        = "${local.stack_name}-service"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
