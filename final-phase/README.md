# Final Phase Delivery

This folder contains the rubric-aligned implementation for:

1. Phase 1 - Testing and report generation
2. Phase 2 - Terraform infrastructure provisioning
3. Phase 3 - Docker build, ECR push, ECS Fargate deployment, and verification

## Files

- `Dockerfile`: Multi-stage backend image, non-root runtime user, Docker healthcheck
- `terraform/`: Terraform code for S3, ECR, ECS, CloudWatch Logs, and networking
- `scripts/verify-ecs.sh`: Waits for ECS service stability and prints service status
- `scripts/clean.sh`: Cleans AWS resources created by this project prefix

## GitHub Secrets

Required (as requested):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

Optional (recommended if LabRole name differs):

- `ECS_EXECUTION_ROLE_ARN`
- `ECS_TASK_ROLE_ARN`

If optional role secrets are not provided, the workflow falls back to:

- `arn:aws:iam::<account-id>:role/LabRole`

## Terraform Notes

- No IAM roles are created in Terraform.
- Existing lab role ARNs are injected during Phase 3 deployment.
- Region defaults to `us-east-1`.
- Resource names include a random stack suffix to avoid local-vs-CI naming collisions.
- S3 rubric requirements are implemented:
  - Unique bucket name
  - Versioning enabled
  - Encryption enabled (SSE-S3)
  - Public access blocked

## Local Run (optional)

From `final-phase/terraform`:

```bash
terraform init
terraform validate
terraform plan -var="deploy_ecs_service=false"
```

Then deploy with image:

```bash
terraform plan \
  -var="deploy_ecs_service=true" \
  -var="container_image=<ecr-uri:tag>" \
  -var="ecs_execution_role_arn=<existing-role-arn>"
```

## Cleanup

From repo root:

```bash
./final-phase/scripts/clean.sh
# or non-interactive:
./final-phase/scripts/clean.sh --yes
```

This script:
- Runs `terraform destroy` if local state exists
- Removes local Terraform state files
- Tries to delete leftover resources by project prefix in `us-east-1`
