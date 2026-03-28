import "dotenv/config";
import { pruneLoginAttempts } from "@/server/jobs/prune-logs.job";

async function main() {
  console.log("Starting prune-logs job...");
  
  const deletedCount = await pruneLoginAttempts();
  
  console.log(`PruneLogs job completed. Deleted ${deletedCount} login_attempts records older than 30 days.`);
}

main().catch((error) => {
  console.error("PruneLogs job failed:", error);
  process.exit(1);
});