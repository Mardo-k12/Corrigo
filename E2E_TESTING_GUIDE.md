# E2E & Performance Testing Guide

## 🧪 E2E Tests (Cypress)

### Setup
```bash
cd artifacts/e2e
pnpm install
```

### Run Tests
```bash
# Interactive mode
pnpm test:e2e:open

# Headless mode
pnpm test:e2e

# CI mode
pnpm test:e2e:ci
```

### Tests Included
- ✅ Health check endpoint
- ✅ OCR validation
- ✅ Rate limiting
- ✅ Frontend navigation
- ✅ Error handling

**Location**: [artifacts/e2e/cypress/e2e/api.cy.ts](artifacts/e2e/cypress/e2e/api.cy.ts)

---

## 📊 Load Testing (k6)

### Installation (Windows)
```bash
# Using chocolatey
choco install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### Run Load Tests
```bash
cd artifacts/e2e

# Standard load test (100-200 users over 16 minutes)
pnpm test:load

# Stress test (gradually increase to 500 users)
pnpm test:load:stress

# Spike test (sudden 500 user spike)
pnpm test:load:spike
```

### Test Configurations

#### Main Load Test
- 2min ramp-up to 100 users
- 5min at 100 users
- 2min spike to 200 users
- 5min at 200 users
- 2min ramp-down
- **Thresholds**: p(95) < 500ms, p(99) < 1000ms

#### Stress Test
- Gradually increase from 0 to 500 users (each stage 2min)
- Tests system limits
- Monitors for degradation

#### Spike Test
- Baseline 50 users
- Sudden spike to 500 users (10 seconds)
- Verify recovery

**Files**:
- [load-tests/main.js](artifacts/e2e/load-tests/main.js)
- [load-tests/stress-test.js](artifacts/e2e/load-tests/stress-test.js)
- [load-tests/spike-test.js](artifacts/e2e/load-tests/spike-test.js)

---

## 🔍 DataDog Monitoring

### Setup
```bash
# Add to .env.local
DATADOG_ENABLED=true
DATADOG_API_KEY=your-key-from-datadog
DATADOG_APP_KEY=your-app-key
DATADOG_SITE=datadoghq.com
DATADOG_SERVICE=corrigo-api
DATADOG_ENVIRONMENT=production
```

### Features
- Automatic request metrics tracking
- Error tracking and alerting
- Performance monitoring
- Custom metrics

**Implementation**: [src/lib/datadog.ts](artifacts/api-server/src/lib/datadog.ts)

---

## 🌱 Database Seeding

### Seed Data
```bash
cd lib/db
pnpm ts-node src/seed.ts
```

### Includes
- ✅ Test users (teacher, admin)
- ✅ Sample courses
- ✅ Test exams
- ✅ Sample grades

**Files**:
- [lib/db/src/seed.ts](lib/db/src/seed.ts)
- [lib/db/src/fixtures.ts](lib/db/src/fixtures.ts)

### Test Fixtures
Use in E2E tests:
```typescript
import { testFixtures } from "@workspace/db";

const teacher = testFixtures.users.teacher;
const course = testFixtures.courses.math101;
```

---

## 📈 Performance Metrics

### Key Metrics Tracked
- **Response Time**: p(95), p(99)
- **Request Volume**: requests/sec
- **Error Rate**: 4xx, 5xx responses
- **Rate Limit Hits**: 429 responses
- **Image Compression**: KB saved

### Viewing Results
```bash
# After load test, k6 outputs
✓ checks
✓ http_req_duration
✓ http_req_failed

# DataDog dashboard: https://app.datadoghq.com
```

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/ci-cd.yml

- name: E2E Tests
  run: cd artifacts/e2e && pnpm test:e2e:ci

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: cypress-videos
    path: artifacts/e2e/cypress/videos
```

---

## 🚀 Best Practices

### E2E Tests
- ✅ Test critical user flows
- ✅ Use `cy.intercept()` to mock API responses
- ✅ Handle async operations with proper timeouts
- ✅ Clean up data after tests (fixtures)

### Load Testing
- ✅ Run against staging before production
- ✅ Gradually increase load (ramp-up)
- ✅ Monitor resource usage (CPU, memory, DB connections)
- ✅ Set realistic thresholds based on requirements

### Monitoring
- ✅ Alert on error rate > 1%
- ✅ Alert on p(99) latency > 2000ms
- ✅ Track business metrics (exams graded, etc.)
- ✅ Create dashboards for visibility

---

## 📋 Troubleshooting

### Cypress Issues
```bash
# Clear cache
pnpm cypress cache clear

# Debug mode
DEBUG=cypress:* pnpm test:e2e:open

# Check browser compatibility
pnpm cypress verify
```

### k6 Issues
```bash
# Check installation
k6 version

# Run with debug output
k6 run --verbose load-tests/main.js

# Check system resources
Get-Process k6  # PowerShell
```

### DataDog Issues
- Verify API key is correct
- Check network connectivity
- Ensure service name is set
- Review DataDog logs

---

## 📞 Next Steps

1. **Run E2E tests**: `pnpm test:e2e:open`
2. **Execute load test**: `pnpm test:load`
3. **Configure DataDog**: Set environment variables
4. **Seed database**: `pnpm ts-node src/seed.ts`
5. **Monitor metrics**: Check dashboards

---

*For more details, see individual test files or DataDog documentation.*
