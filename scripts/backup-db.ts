import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = 7;

async function runBackup() {
  console.log("=== PHARMNODE DATABASE BACKUP ===");
  
  // Ensure backups directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let backupSuccessful = false;

  // 1. Attempt pg_dump
  try {
    console.log("Checking for 'pg_dump' utility...");
    execSync("pg_dump --version", { stdio: "ignore" });
    
    console.log("Running pg_dump backup...");
    const sqlFile = path.join(BACKUP_DIR, `backup_sql_${timestamp}.sql`);
    
    // pg_dump supports passing DATABASE_URL directly as connection argument
    execSync(`pg_dump "${databaseUrl}" -F p -f "${sqlFile}"`, {
      stdio: "inherit",
    });

    console.log(`Successfully created SQL backup: ${sqlFile}`);
    backupSuccessful = true;
  } catch (error) {
    console.warn("Warning: pg_dump backup failed or tool not found in PATH.");
    console.log("Proceeding with Prisma-based JSON data export fallback...");
  }

  // 2. Fallback: Prisma JSON export
  if (!backupSuccessful) {
    try {
      console.log("Querying database tables...");
      const [users, recipes, customIngredients, webhooks] = await Promise.all([
        prisma.user.findMany(),
        prisma.recipe.findMany(),
        prisma.customIngredient.findMany(),
        prisma.processedWebhook.findMany(),
      ]);

      const dataDump = {
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          counts: {
            users: users.length,
            recipes: recipes.length,
            customIngredients: customIngredients.length,
            webhooks: webhooks.length,
          },
        },
        users,
        recipes,
        customIngredients,
        webhooks,
      };

      const jsonFile = path.join(BACKUP_DIR, `backup_json_${timestamp}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify(dataDump, null, 2), "utf8");
      
      console.log(`Successfully created JSON data backup: ${jsonFile}`);
      backupSuccessful = true;
    } catch (err) {
      console.error("Critical Error: Prisma-based JSON export failed.", err);
      process.exit(1);
    }
  }

  // 3. Prune old backups (keep only the latest MAX_BACKUPS files)
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        return {
          name: file,
          path: filePath,
          stat: fs.statSync(filePath)
        };
      })
      .filter(item => item.stat.isFile() && (item.name.startsWith("backup_sql_") || item.name.startsWith("backup_json_")));

    // Sort files by modification time (oldest first)
    files.sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);

    if (files.length > MAX_BACKUPS) {
      const toDeleteCount = files.length - MAX_BACKUPS;
      console.log(`Pruning backups: keeping latest ${MAX_BACKUPS}, deleting oldest ${toDeleteCount} backup files.`);
      
      for (let i = 0; i < toDeleteCount; i++) {
        fs.unlinkSync(files[i].path);
        console.log(`Deleted old backup file: ${files[i].name}`);
      }
    }
  } catch (pruneErr) {
    console.warn("Warning: Failed to prune old backup files.", pruneErr);
  }

  console.log("=== BACKUP PROCESS COMPLETED ===\n");
}

runBackup()
  .catch(err => {
    console.error("Backup script crashed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
