#!/bin/bash

# Default to localhost if no URL provided
URL=${1:-http://localhost:9876}

# Run vite with the provided frontend URL
FRONTEND_URL=$URL npm run dev
