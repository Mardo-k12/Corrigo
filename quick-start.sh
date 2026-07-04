#!/bin/bash
# Quick Start Script for Corrigo (Linux/Mac)

set -e

echo "🚀 Corrigo - Exam Grading System (10/10)"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 20.x${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing globally...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✅ Prerequisites verified${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup environment
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}📝 Created .env.local (update with your configuration)${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi
if [ ! -f artifacts/api-server/.env.local ]; then
    cp artifacts/api-server/.env.example artifacts/api-server/.env.local
    echo -e "${YELLOW}📝 Created artifacts/api-server/.env.local${NC}"
fi
if [ ! -f artifacts/smartgrader/.env.local ]; then
    cp artifacts/smartgrader/.env.example artifacts/smartgrader/.env.local
    echo -e "${YELLOW}📝 Created artifacts/smartgrader/.env.local${NC}"
fi
echo ""

# Database setup
echo -e "${BLUE}🗄️  Database setup...${NC}"
pnpm migrate || echo -e "${YELLOW}⚠️  Migration skipped (ensure PostgreSQL is running)${NC}"
echo ""

# Seed database (optional)
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    pnpm seed
    echo -e "${GREEN}✅ Database seeded${NC}"
fi
echo ""

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""
echo -e "${GREEN}Available commands:${NC}"
echo "  pnpm dev              - Start all services in development mode"
echo "  pnpm test             - Run all tests"
echo "  pnpm test:e2e         - Run E2E tests (headless)"
echo "  pnpm test:e2e:open    - Run E2E tests (interactive)"
echo "  pnpm test:load        - Run load tests"
echo "  pnpm lint             - Lint check"
echo "  pnpm build            - Build all workspaces"
echo ""
echo -e "${YELLOW}Services will be available at:${NC}"
echo "  API Server: http://localhost:5001"
echo "  Web Frontend: http://localhost:5173"
echo "  Mobile API Base: http://localhost:5001/api"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Ready to start development? Run:"
echo -e "${BLUE}  pnpm dev${NC}"
echo ""
