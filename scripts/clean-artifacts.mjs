// Remove any empty or zero-length build-info output files that can break tools expecting valid JSON
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const buildInfoDir = join(process.cwd(), "artifacts", "build-info");

try {
  const files = readdirSync(buildInfoDir);
  let removed = 0;
  for (const f of files) {
    if (f.endsWith(".output.json")) {
      const full = join(buildInfoDir, f);
      const st = statSync(full);
      if (st.size === 0) {
        unlinkSync(full);
        removed++;
        console.log("Removed empty build-info output:", f);
      }
    }
  }
  if (removed === 0) console.log("No empty build-info output files found.");
} catch (e) {
  // If the folder doesn't exist, that's fine.
  console.log("No build-info directory or unable to read; skipping.");
}
