#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="$ROOT_DIR/final-phase/terraform"

REGION="${AWS_REGION:-us-east-1}"
PROJECT_PREFIX="${PROJECT_PREFIX:-shopsmart-final}"
S3_BUCKET_PREFIX="${S3_BUCKET_PREFIX:-shopsmart-final-artifacts-}"

log() {
  printf '[clean] %s\n' "$1"
}

warn() {
  printf '[clean][warn] %s\n' "$1"
}

if [[ "${1:-}" != "--yes" ]]; then
  echo "This will delete AWS resources in region ${REGION} with prefixes:"
  echo "- ${PROJECT_PREFIX}-*"
  echo "- ${S3_BUCKET_PREFIX}*"
  echo ""
  read -r -p "Type DELETE to continue: " CONFIRM
  if [[ "$CONFIRM" != "DELETE" ]]; then
    echo "Canceled."
    exit 0
  fi
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required."
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "Terraform CLI is required."
  exit 1
fi

if ! aws sts get-caller-identity --region "$REGION" >/dev/null 2>&1; then
  echo "AWS credentials are not available for region ${REGION}."
  exit 1
fi

log "Region: ${REGION}"
log "Project prefix: ${PROJECT_PREFIX}"

# 1) Try Terraform-managed destroy first if local state exists.
if ls "$TF_DIR"/terraform.tfstate* >/dev/null 2>&1; then
  log "Local Terraform state found. Running terraform destroy..."
  terraform -chdir="$TF_DIR" init -input=false >/dev/null
  terraform -chdir="$TF_DIR" destroy -auto-approve -input=false -var="aws_region=${REGION}" || warn "terraform destroy had errors; continuing with deep cleanup"
else
  log "No local Terraform state found. Skipping terraform destroy step."
fi

# 2) Deep cleanup by prefix (handles orphaned resources from previous runs).

# ECS: delete services, then clusters.
cluster_arns="$(aws ecs list-clusters --region "$REGION" --query 'clusterArns' --output text 2>/dev/null || true)"
for cluster_arn in $cluster_arns; do
  cluster_name="${cluster_arn##*/}"
  [[ "$cluster_name" == ${PROJECT_PREFIX}-* ]] || continue

  log "Deleting ECS services in cluster: ${cluster_name}"
  service_arns="$(aws ecs list-services --cluster "$cluster_name" --region "$REGION" --query 'serviceArns' --output text 2>/dev/null || true)"

  for service_arn in $service_arns; do
    service_name="${service_arn##*/}"
    log "Deleting ECS service: ${service_name}"
    aws ecs delete-service --cluster "$cluster_name" --service "$service_name" --force --region "$REGION" >/dev/null 2>&1 || true
    aws ecs wait services-inactive --cluster "$cluster_name" --services "$service_name" --region "$REGION" >/dev/null 2>&1 || true
  done

  log "Deleting ECS cluster: ${cluster_name}"
  aws ecs delete-cluster --cluster "$cluster_name" --region "$REGION" >/dev/null 2>&1 || true
done

# ECS task definitions (old revisions).
task_defs="$(aws ecs list-task-definitions --region "$REGION" --query 'taskDefinitionArns' --output text 2>/dev/null || true)"
for task_def in $task_defs; do
  task_family_revision="${task_def##*/}"
  task_family="${task_family_revision%:*}"
  [[ "$task_family" == ${PROJECT_PREFIX}-* ]] || continue

  log "Deregistering task definition: ${task_family_revision}"
  aws ecs deregister-task-definition --task-definition "$task_def" --region "$REGION" >/dev/null 2>&1 || true
done

# ECR repositories.
repos="$(aws ecr describe-repositories --region "$REGION" --query 'repositories[].repositoryName' --output text 2>/dev/null || true)"
for repo in $repos; do
  [[ "$repo" == ${PROJECT_PREFIX}-* ]] || continue

  log "Deleting ECR repository: ${repo}"
  aws ecr delete-repository --repository-name "$repo" --force --region "$REGION" >/dev/null 2>&1 || true
done

# CloudWatch log groups.
log_groups="$(aws logs describe-log-groups --region "$REGION" --query 'logGroups[].logGroupName' --output text 2>/dev/null || true)"
for lg in $log_groups; do
  [[ "$lg" == "/ecs/${PROJECT_PREFIX}-"* ]] || continue

  log "Deleting CloudWatch log group: ${lg}"
  aws logs delete-log-group --log-group-name "$lg" --region "$REGION" >/dev/null 2>&1 || true
done

# Security groups.
sg_rows="$(aws ec2 describe-security-groups --region "$REGION" --query 'SecurityGroups[].[GroupId,GroupName]' --output text 2>/dev/null || true)"
while IFS=$'\t' read -r group_id group_name; do
  [[ -z "${group_id:-}" ]] && continue
  [[ "$group_name" == ${PROJECT_PREFIX}-* ]] || continue

  log "Deleting security group: ${group_name} (${group_id})"
  aws ec2 delete-security-group --group-id "$group_id" --region "$REGION" >/dev/null 2>&1 || true
done <<< "$sg_rows"

# S3 buckets by prefix (includes versioned object cleanup).
buckets="$(aws s3api list-buckets --query 'Buckets[].Name' --output text 2>/dev/null || true)"
for bucket in $buckets; do
  [[ "$bucket" == ${S3_BUCKET_PREFIX}* ]] || continue

  log "Cleaning S3 bucket: ${bucket}"

  aws s3 rm "s3://${bucket}" --recursive --region "$REGION" >/dev/null 2>&1 || true

  while IFS=$'\t' read -r key version_id; do
    [[ -z "${key:-}" || -z "${version_id:-}" ]] && continue
    aws s3api delete-object --bucket "$bucket" --key "$key" --version-id "$version_id" --region "$REGION" >/dev/null 2>&1 || true
  done < <(aws s3api list-object-versions --bucket "$bucket" --query 'Versions[].[Key,VersionId]' --output text --region "$REGION" 2>/dev/null || true)

  while IFS=$'\t' read -r key version_id; do
    [[ -z "${key:-}" || -z "${version_id:-}" ]] && continue
    aws s3api delete-object --bucket "$bucket" --key "$key" --version-id "$version_id" --region "$REGION" >/dev/null 2>&1 || true
  done < <(aws s3api list-object-versions --bucket "$bucket" --query 'DeleteMarkers[].[Key,VersionId]' --output text --region "$REGION" 2>/dev/null || true)

  aws s3api delete-bucket --bucket "$bucket" --region "$REGION" >/dev/null 2>&1 || true
done

# 3) Remove local Terraform generated files.
log "Removing local Terraform working files..."
rm -rf "$TF_DIR/.terraform"
rm -f "$TF_DIR"/terraform.tfstate "$TF_DIR"/terraform.tfstate.backup "$TF_DIR"/tfplan-infra "$TF_DIR"/tfplan-deploy

log "Cleanup complete."
