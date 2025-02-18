#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_ENV"

if [[  "$VERCEL_GIT_COMMIT_REF" == "logistics-staging" || "$VERCEL_GIT_COMMIT_REF" == "logistics-develop" || "$VERCEL_GIT_COMMIT_REF" == "logistics-main"  ]] ; then
  # Proceed with the build
    echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi