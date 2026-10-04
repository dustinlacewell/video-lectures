import { join } from "node:path";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../../traits/video.js";

/** Backfill word timings for every voice clip whose words.json is stale against the render hash cache. */
export default cmd({
  needs: [video],
  select: "one",
  handler: (_, { project, workspace, exec }) =>
    exec(`uv run words.py --video "${project.dir}"`, { cwd: join(workspace.root, "packages/voice/py"), timeout: 600_000 }),
});
