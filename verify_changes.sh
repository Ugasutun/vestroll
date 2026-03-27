#!/bin/bash
echo "=== Verifying Organization Slug Implementation ==="
echo ""

echo "1. Checking slug utility exists..."
if [ -f "src/server/utils/slug.ts" ]; then
    echo "✅ slug.ts exists"
else
    echo "❌ slug.ts missing"
fi

echo ""
echo "2. Checking schema has slug column..."
if grep -q 'slug: varchar("slug"' src/server/db/schema.ts; then
    echo "✅ Schema has slug column"
else
    echo "❌ Schema missing slug column"
fi

echo ""
echo "3. Checking migration exists..."
if [ -f "drizzle/migrations/0009_add_organization_slug.sql" ]; then
    echo "✅ Migration file exists"
else
    echo "❌ Migration file missing"
fi

echo ""
echo "4. Checking auth.service imports generateSlug..."
if grep -q 'import { generateSlug }' src/server/services/auth.service.ts; then
    echo "✅ auth.service imports generateSlug"
else
    echo "❌ auth.service missing generateSlug import"
fi

echo ""
echo "5. Checking auth.service uses generateSlug..."
if grep -q 'const slug = generateSlug' src/server/services/auth.service.ts; then
    echo "✅ auth.service uses generateSlug"
else
    echo "❌ auth.service doesn't use generateSlug"
fi

echo ""
echo "6. Checking for merge conflict markers..."
if grep -q '^[<>=]\{7\}' src/server/services/auth.service.ts; then
    echo "❌ Merge conflict markers found!"
    grep -n '^[<>=]\{7\}' src/server/services/auth.service.ts
else
    echo "✅ No merge conflict markers"
fi

echo ""
echo "7. Running lint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lint passed"
else
    echo "❌ Lint failed"
fi

echo ""
echo "8. Running tests..."
npm test -- src/server/utils/slug.test.ts > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
fi

echo ""
echo "=== Verification Complete ==="
