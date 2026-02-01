#!/bin/bash

echo "Testing Pokedex Backend API"
echo "=============================="
echo ""

echo "1. Testing Login with valid credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')
echo "Response: $LOGIN_RESPONSE"
echo ""

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token extracted: $TOKEN"
echo ""

echo "2. Testing Login with invalid credentials..."
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}'
echo ""
echo ""

echo "3. Testing GET /pokemons without token (should fail)..."
curl -s -X GET http://localhost:3000/pokemons
echo ""
echo ""

echo "4. Testing GET /pokemons with valid token..."
curl -s -X GET http://localhost:3000/pokemons \
  -H "Authorization: Bearer $TOKEN" | head -c 500
echo "... (truncated)"
echo ""
echo ""

echo "5. Testing GET /pokemons/1 with valid token..."
curl -s -X GET http://localhost:3000/pokemons/1 \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "Tests completed!"
