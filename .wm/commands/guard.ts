import { join } from "node:path";
import { z } from "zod";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

const TOOLS = join(import.meta.dirname, "..", "..", "studio", "tools");

/** Build a video and compare it against its blessed golden frames (videos/<slug>/golden/frames.json).
    --control runs the negative control instead: a sample must differ from itself half the video away. */
export default cmd({
  needs: [video],
  select: "one",
  flags: { control: z.boolean().default(false) },
  handler: async (args, { project, sh, exec }) => {
    const build = await sh(["pnpm exec tsc --noEmit", "pnpm exec vite build"], { timeout: 180_000 });
    if (build.isError) return build;
    const dist = join(project.dir, "dist");
    const out = join(project.dir, ".scratch", "guard");
    const script = join(project.dir, "script", "index.ts");
    const goldenDir = join(project.dir, "golden");
    const flag = args.control ? " --control" : "";
    return exec(
      `pnpm exec tsx guard/cli.ts --build "${dist}" --script "${script}" --out "${out}" --golden "${goldenDir}"${flag}`,
      { cwd: TOOLS, timeout: 300_000 },
    );
  },
});
