#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <module-name>"
  exit 1
fi

MODULE_NAME=$1

# Generate Module, Controller, and Service
nest g mo $MODULE_NAME
nest g co $MODULE_NAME
nest g s $MODULE_NAME

echo "Module, Controller, and Service for '$MODULE_NAME' created successfully!"
