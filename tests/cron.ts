// cron.ts
import cleanupExpiredFiles from "../routes/files/deleteExpiredFiles.ts";

// Run once a day
async function runCleanup() {
  console.log("Running cleanup job:", new Date());
  
  try {
    await cleanupExpiredFiles();
    console.log("Cleanup completed successfully");
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
  
  // Schedule next run in 24 hours
  setTimeout(runCleanup, 24 * 60 * 60 * 1000);
}

// Start cleanup process
runCleanup();

export default runCleanup;