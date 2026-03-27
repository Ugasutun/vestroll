/**
 * Comprehensive seed script for Vestroll.
 *
 * Run:  pnpm db:seed
 *
 * Safe to run multiple times — uses onConflictDoNothing throughout.
 *
 * What it creates:
 *   • 1 test organization  (Vestroll Inc.)
 *   • 1 admin user         (seed admin)
 *   • 55 employees         (7 departments, mixed Active/Inactive, Freelancer/Contractor)
 *   • 1-3 milestones per employee
 *   • 1 contract per employee
 *   • 1 timesheet entry per employee
 */
import { faker } from "@faker-js/faker";
import { db } from "./index";
import {
  organizations,
  users,
  employees,
  milestones,
  contracts,
  timesheets,
} from "./schema";
import { generateSlug } from "../utils/slug";
import { eq } from "drizzle-orm";

faker.seed(42);

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Finance",
  "Operations",
  "Customer Success",
];

const ROLES: Record<string, string[]> = {
  Engineering: [
    "Backend Engineer",
    "Frontend Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Mobile Engineer",
  ],
  Design: ["UI Designer", "UX Researcher", "Motion Designer", "Brand Designer"],
  Product: ["Product Manager", "Business Analyst", "Scrum Master"],
  Marketing: [
    "Content Strategist",
    "SEO Specialist",
    "Growth Marketer",
    "Social Media Manager",
  ],
  Finance: ["Financial Analyst", "Accountant", "Treasury Manager"],
  Operations: ["Operations Manager", "Logistics Coordinator", "Data Analyst"],
  "Customer Success": [
    "Customer Success Manager",
    "Support Engineer",
    "Onboarding Specialist",
  ],
};

const EMPLOYEE_TYPES = ["Freelancer", "Contractor"] as const;
const EMPLOYEE_STATUSES = ["Active", "Inactive"] as const;
const CONTRACT_TYPES = ["fixed_rate", "pay_as_you_go", "milestone"] as const;
const CONTRACT_STATUSES = [
  "active",
  "completed",
  "pending_signature",
  "in_review",
] as const;
const PAYMENT_TYPES = ["fiat", "crypto"] as const;
const MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "approved",
  "rejected",
] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
const MILESTONE_NAMES = [
  "MVP Backend",
  "UI Prototype",
  "API Integration",
  "QA & Testing",
  "Deployment",
  "User Research",
  "Brand Refresh",
  "Performance Audit",
  "Security Review",
  "Documentation",
  "Analytics Setup",
  "Onboarding Flow",
  "Payment Gateway",
  "Dashboard v2",
  "Mobile Release",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function seed() {
  console.log("Starting seed...\n");

  console.log("Upserting organization...");

  let orgId: string;
  const existingOrgs = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.name, "Vestroll Inc."))
    .limit(1);

  if (existingOrgs.length > 0) {
    orgId = existingOrgs[0].id;
    console.log(`   ✔ Found existing org: ${orgId}`);
  } else {
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: "Vestroll Inc.",
        slug: generateSlug("Vestroll Inc."),
        industry: "Fintech",
        registrationNumber: "RC-1234567",
        registeredStreet: "14 Innovation Drive",
        registeredCity: "Lagos",
        registeredState: "Lagos",
        registeredPostalCode: "100001",
        registeredCountry: "Nigeria",
        billingStreet: "14 Innovation Drive",
        billingCity: "Lagos",
        billingState: "Lagos",
        billingPostalCode: "100001",
        billingCountry: "Nigeria",
      })
      .returning({ id: organizations.id });

    orgId = newOrg.id;
    console.log(`Created org: ${orgId}`);
  }

  console.log("Upserting admin user...");
  const [adminUser] = await db
    .insert(users)
    .values({
      firstName: "Samix",
      lastName: "Yasuke",
      email: "samix@vestroll.com",
      role: "admin",
      status: "active",
      organizationId: orgId,
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const adminUserId =
    adminUser?.id ??
    (
      await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, "samix@vestroll.com"))
        .limit(1)
    )[0].id;

  console.log(`Admin user id: ${adminUserId}`);

  console.log("\nInserting 55 employees...");

  /**
   * Distribution plan (≥5 departments, mix of Active/Inactive and both types):
   *  Engineering      → 12  (heavy)
   *  Design           →  8
   *  Product          →  7
   *  Marketing        →  7
   *  Finance          →  7
   *  Operations       →  7
   *  Customer Success →  7
   *                     --
   *                     55
   */
  const distribution: Array<{ dept: string; count: number }> = [
    { dept: "Engineering", count: 12 },
    { dept: "Design", count: 8 },
    { dept: "Product", count: 7 },
    { dept: "Marketing", count: 7 },
    { dept: "Finance", count: 7 },
    { dept: "Operations", count: 7 },
    { dept: "Customer Success", count: 7 },
  ];

  const employeeRecords: {
    id: string;
    orgId: string;
    dept: string;
  }[] = [];

  for (const { dept, count } of distribution) {
    const roles = ROLES[dept];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      // ~75 % Active, ~25 % Inactive
      const status = pickWeighted([...EMPLOYEE_STATUSES], [75, 25]);

      // ~60 % Contractor, ~40 % Freelancer
      const type = pickWeighted([...EMPLOYEE_TYPES], [60, 40]);

      const email = faker.internet
        .email({ firstName, lastName, provider: "vestroll-seed.dev" })
        .toLowerCase();

      const [emp] = await db
        .insert(employees)
        .values({
          organizationId: orgId,
          firstName,
          lastName,
          email,
          role: pick(roles),
          department: dept,
          type,
          status,
          bankName: faker.helpers.arrayElement([
            "GTBank",
            "Access Bank",
            "Zenith Bank",
            "UBA",
            "First Bank",
          ]),
          accountNumber: faker.finance.accountNumber(10),
          accountHolderName: `${firstName} ${lastName}`,
        })
        .onConflictDoNothing()
        .returning({ id: employees.id });

      if (emp) {
        employeeRecords.push({ id: emp.id, orgId, dept });
        process.stdout.write(".");
      }
    }
  }

  console.log(`\n   ✔ Inserted ${employeeRecords.length} new employee records`);

  if (employeeRecords.length === 0) {
    // Employees already exist — fetch existing ids so we can still seed milestones etc.
    console.log(
      "Employees already present; fetching existing ids for dependents...",
    );
    const existing = await db
      .select({
        id: employees.id,
        dept: employees.department,
        orgId: employees.organizationId,
      })
      .from(employees)
      .where(eq(employees.organizationId, orgId));

    for (const e of existing) {
      employeeRecords.push({
        id: e.id,
        orgId: e.orgId!,
        dept: e.dept ?? "Engineering",
      });
    }
  }

  console.log("\n🏁  Inserting milestones...");
  let milestoneCount = 0;

  for (const emp of employeeRecords) {
    const numMilestones = faker.number.int({ min: 1, max: 3 });

    for (let m = 0; m < numMilestones; m++) {
      await db
        .insert(milestones)
        .values({
          milestoneName: `${pick(MILESTONE_NAMES)} — ${faker.word.adjective()} phase`,
          amount: faker.number.int({ min: 500, max: 15000 }),
          dueDate: randomDate(new Date("2025-01-01"), new Date("2026-12-31")),
          status: pick(MILESTONE_STATUSES),
          employeeId: emp.id,
          submittedAt: new Date(),
        })
        .onConflictDoNothing();

      milestoneCount++;
    }
  }

  console.log(`   ✔ Inserted ${milestoneCount} milestone records`);

  console.log("\n📄  Inserting contracts...");
  let contractCount = 0;

  for (const emp of employeeRecords) {
    const startDate = randomDate(
      new Date("2024-01-01"),
      new Date("2025-06-01"),
    );
    const endDate = new Date(startDate);
    endDate.setMonth(
      endDate.getMonth() + faker.number.int({ min: 3, max: 18 }),
    );

    await db
      .insert(contracts)
      .values({
        organizationId: orgId,
        employeeId: emp.id,
        title: `${faker.word.adjective({ strategy: "closest" })} ${emp.dept} Contract`,
        amount: faker.number.int({ min: 1_000, max: 50_000 }),
        paymentType: pick(PAYMENT_TYPES),
        contractType: pick(CONTRACT_TYPES),
        status: pick(CONTRACT_STATUSES),
        startDate,
        endDate,
      })
      .onConflictDoNothing();

    contractCount++;
  }

  console.log(`   ✔ Inserted ${contractCount} contract records`);

  console.log("\n⏱️   Inserting timesheets...");
  let timesheetCount = 0;

  for (const emp of employeeRecords) {
    const rate = faker.number.int({ min: 15, max: 150 });
    const totalWorked = faker.number.int({ min: 8, max: 160 });
    const totalAmount = rate * totalWorked;

    await db
      .insert(timesheets)
      .values({
        organizationId: emp.orgId,
        employeeId: emp.id,
        rate,
        totalWorked,
        totalAmount,
        status: pick(APPROVAL_STATUSES),
        submittedAt: randomDate(new Date("2025-01-01"), new Date()),
      })
      .onConflictDoNothing();

    timesheetCount++;
  }

  console.log(`   ✔ Inserted ${timesheetCount} timesheet records`);

  console.log(`
✅  Seed complete!
   Organization : Vestroll Inc. (${orgId})
   Admin user   : samix@vestroll.com
   Employees    : ${employeeRecords.length} records across ${distribution.length} departments
   Milestones   : ${milestoneCount}
   Contracts    : ${contractCount}
   Timesheets   : ${timesheetCount}
`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
