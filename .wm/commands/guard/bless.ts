import { join } from "node:path";
import { z } from "zod";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../../traits/video.js";

const TOOLS = join(import.meta.dirname, "..", "..", "..", "studio", "tools");

/** Build a video and bless its current frames as the golden (videos/<slug>/golden/).
    Refuses on a dirty tree outside golden/, unless --force (after a human watch approves the change). */
export default cmd({
  needs: [video],
  select: "one",
  flags: { force: z.boolean().default(false) },
  handler: async (args, { project, sh, exec }) => {
    const build = await sh(["pnpm exec tsc --noEmit", "pnpm exec vite build"], { timeout: 180_000 });
    if (build.isError) return build;
    const dist = join(project.dir, "dist");
    const out = join(project.dir, ".scratch", "guard-bless");
    const script = join(project.dir, "script", "index.ts");
    const goldenDir = join(project.dir, "golden");
    const force = args.force ? " --force" : "";
    return exec(
      `pnpm exec tsx guard/bless-cli.ts --build "${dist}" --script "${script}" --out "${out}" --golden "${goldenDir}"${force}`,
      { cwd: TOOLS, timeout: 300_000 },
    );
  },
});
