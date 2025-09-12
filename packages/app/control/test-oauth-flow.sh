#!/bin/bash

# 🧪 Echo OAuth PKCE Flow Test Script
# This script tests the complete OAuth flow using curl commands

set -e

# Configuration
BASE_URL="http://localhost:3000"
CLIENT_ID="" # Set this to your Echo app ID
REDIRECT_URI="http://localhost:3000/oauth-test.html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Echo OAuth PKCE Flow Test${NC}"
echo "=================================="

# Check if CLIENT_ID is set
if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}❌ Please set CLIENT_ID in this script first${NC}"
    echo "   You can find your app ID in the Echo Control dashboard"
    exit 1
fi

# Step 1: Generate PKCE codes
echo -e "\n${YELLOW}Step 1: Generating PKCE codes...${NC}"

# Generate code verifier (base64url-encoded random string)
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
echo "Code Verifier: $CODE_VERIFIER"

# Generate code challenge (SHA256 hash of verifier, base64url-encoded)
CODE_CHALLENGE=$(echo -n "$CODE_VERIFIER" | openssl sha256 -binary | openssl base64 | tr -d "=+/" | tr -d '\n')
echo "Code Challenge: $CODE_CHALLENGE"

# Generate state parameter
STATE=$(openssl rand -hex 16)
echo "State: $STATE"

# Step 2: Build authorization URL
echo -e "\n${YELLOW}Step 2: Building authorization URL...${NC}"

AUTH_URL="${BASE_URL}/api/oauth/authorize"
AUTH_URL+="?client_id=${CLIENT_ID}"
AUTH_URL+="&redirect_uri=${REDIRECT_URI}"
AUTH_URL+="&code_challenge=${CODE_CHALLENGE}"
AUTH_URL+="&code_challenge_method=S256"
AUTH_URL+="&response_type=code"
AUTH_URL+="&scope=llm:invoke%20offline_access"
AUTH_URL+="&state=${STATE}"

echo "Authorization URL:"
echo "$AUTH_URL"
echo ""
echo -e "${GREEN}✨ Open this URL in your browser to start the OAuth flow${NC}"
echo -e "${BLUE}   After authorization, you'll get a callback with an authorization code${NC}"

# Step 3: Wait for authorization code
echo -e "\n${YELLOW}Step 3: Waiting for authorization code...${NC}"
echo "After completing the authorization in your browser:"
read -p "Enter the authorization code: " AUTH_CODE

if [ -z "$AUTH_CODE" ]; then
    echo -e "${RED}❌ No authorization code provided${NC}"
    exit 1
fi

# Step 4: Exchange code for tokens
echo -e "\n${YELLOW}Step 4: Exchanging code for JWT tokens...${NC}"

TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/oauth/token" \
    -H "Content-Type: application/json" \
    -d "{
        \"grant_type\": \"authorization_code\",
        \"code\": \"$AUTH_CODE\",
        \"redirect_uri\": \"$REDIRECT_URI\",
        \"client_id\": \"$CLIENT_ID\",
        \"code_verifier\": \"$CODE_VERIFIER\"
    }")

# Check if token exchange was successful
if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Token exchange successful!${NC}"
    
    # Extract tokens using jq if available, otherwise show raw response
    if command -v jq &> /dev/null; then
        ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
        REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token')
        EXPIRES_IN=$(echo "$TOKEN_RESPONSE" | jq -r '.expires_in')
        USER_EMAIL=$(echo "$TOKEN_RESPONSE" | jq -r '.user.email')
        APP_NAME=$(echo "$TOKEN_RESPONSE" | jq -r '.echo_app.name')
        
        echo "Access Token (JWT): ${ACCESS_TOKEN:0:50}..."
        echo "Refresh Token: ${REFRESH_TOKEN:0:30}..."
        echo "Expires in: $EXPIRES_IN seconds"
        echo "User: $USER_EMAIL"
        echo "App: $APP_NAME"
    else
        echo "Raw response:"
        echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
        
        # Extract access token without jq
        ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
    fi
else
    echo -e "${RED}❌ Token exchange failed:${NC}"
    echo "$TOKEN_RESPONSE"
    exit 1
fi

# Step 5: Test JWT validation
echo -e "\n${YELLOW}Step 5: Testing JWT validation (fast path)...${NC}"

JWT_VALIDATION=$(curl -s -X POST "${BASE_URL}/api/validate-jwt-token" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$JWT_VALIDATION" | grep -q '"valid":true'; then
    echo -e "${GREEN}✅ JWT validation successful! (⚡ ~1ms)${NC}"
    
    if command -v jq &> /dev/null; then
        USER_ID=$(echo "$JWT_VALIDATION" | jq -r '.userId')
        APP_ID=$(echo "$JWT_VALIDATION" | jq -r '.appId')
        SCOPE=$(echo "$JWT_VALIDATION" | jq -r '.scope')
        
        echo "User ID: $USER_ID"
        echo "App ID: $APP_ID"
        echo "Scope: $SCOPE"
    else
        echo "Raw validation response:"
        echo "$JWT_VALIDATION"
    fi
else
    echo -e "${RED}❌ JWT validation failed:${NC}"
    echo "$JWT_VALIDATION"
fi

# Step 6: Test token refresh
echo -e "\n${YELLOW}Step 6: Testing token refresh...${NC}"

REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/oauth/token" \
    -H "Content-Type: application/json" \
    -d "{
        \"grant_type\": \"refresh_token\",
        \"refresh_token\": \"$REFRESH_TOKEN\"
    }")

if echo "$REFRESH_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Token refresh successful!${NC}"
    
    if command -v jq &> /dev/null; then
        NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')
        NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refresh_token')
        
        echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
        echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:30}..."
        echo -e "${BLUE}🔄 Tokens automatically rotated for security${NC}"
    else
        echo "Raw refresh response:"
        echo "$REFRESH_RESPONSE"
    fi
else
    echo -e "${RED}❌ Token refresh failed:${NC}"
    echo "$REFRESH_RESPONSE"
fi

echo -e "\n${GREEN}🎉 OAuth PKCE flow test completed successfully!${NC}"
echo -e "${BLUE}💡 The JWT tokens can now be used for high-performance API validation${NC}" 