#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?AWS_REGION is required}"
: "${ECS_CLUSTER_NAME:?ECS_CLUSTER_NAME is required}"
: "${ECS_SERVICE_NAME:?ECS_SERVICE_NAME is required}"

echo "Waiting for ECS service to become stable..."
aws ecs wait services-stable \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION"

echo "Fetching final ECS service state..."
aws ecs describe-services \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION" \
  --query 'services[0].{status:status,desiredCount:desiredCount,runningCount:runningCount,pendingCount:pendingCount,taskDefinition:taskDefinition}' \
  --output table

echo "ECS verification complete."
