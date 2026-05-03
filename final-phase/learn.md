# Learn.md - Simple Guide

This file explains what we built and how to run it safely.

## What We Built

We implemented a 3-phase pipeline:

1. Phase 1: Tests + reports
2. Phase 2: Terraform infrastructure
3. Phase 3: Docker build, push to ECR, deploy to ECS Fargate

Main workflow:

- `.github/workflows/final-phase-pipeline.yml`

Main infra folder:

- `final-phase/terraform/`

## Fixed Region

We fixed the region to:

- `us-east-1`

So local and GitHub runs both use the same region by default.

## Required GitHub Secrets

Set these in `Settings -> Secrets and variables -> Actions`:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

Optional role overrides:

- `ECS_EXECUTION_ROLE_ARN`
- `ECS_TASK_ROLE_ARN`

If role secrets are missing, workflow falls back to:

- `arn:aws:iam::<account-id>:role/LabRole`

## Why Local and GitHub Runs Can Clash

Terraform state in GitHub Actions is ephemeral (not persisted between runs in this setup).
That means a new run can try to create resources again.

To reduce clashes, resource names now include a random stack suffix.
Example idea:

- `shopsmart-final-abc123-cluster`
- `shopsmart-final-abc123-repo`

This helps avoid "already exists" failures.

## Safe Run Order

1. Run local tests first.
2. Trigger workflow manually from GitHub Actions.
3. Verify ECS service is stable.
4. Run cleanup when done.

## Cleanup (Important)

Use:

```bash
./final-phase/scripts/clean.sh
```

This script tries to remove:

- Terraform-managed resources (if local state exists)
- Leftover ECS, ECR, log groups, security groups, and S3 buckets by project prefix

Run cleanup after experiments to avoid quota issues and naming leftovers.

## Local Terraform Commands

From `final-phase/terraform`:

```bash
terraform init
terraform validate
terraform plan -var="deploy_ecs_service=false"
```

Deploy stage (example):

```bash
terraform plan \
  -var="deploy_ecs_service=true" \
  -var="container_image=<ecr-uri:tag>" \
  -var="ecs_execution_role_arn=<role-arn>"
```

## Quick Troubleshooting

- ECS role error: set `ECS_EXECUTION_ROLE_ARN` secret explicitly.
- Resource exists error: run `./final-phase/scripts/clean.sh` and retry.
- S3 delete issue: cleanup script includes versioned-object deletion logic.
