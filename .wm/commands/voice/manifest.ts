import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../../traits/video.js";

/** Write voice/manifest.json: one speech job per voice clip, from the script, cast and reference clips. */
export default cmd({
  needs: [video],
  for: "cognition",
  handler: async (_, { project, ok }) => {
    const { buildManifest } = await import("../../../voice/manifest.ts");
    const { readRefs } = await import("../../../voice/refs.ts");
    const { SCRIPT } = await import("../../../script/index.ts");
    const { CAST } = await import("../../../script/cast.ts");
    const voiceDir = join(project.dir, "voice");
    const entries = buildManifest(SCRIPT, CAST, readRefs(CAST, voiceDir));
    writeFileSync(join(voiceDir, "manifest.json"), JSON.stringify(entries, null, 2) + "\n");
    return ok(`voice/manifest.json: ${entries.length} clips`);
  },
});
