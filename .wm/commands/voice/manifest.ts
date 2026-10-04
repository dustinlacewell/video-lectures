import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { cmd } from "@ldlework/workmark/define";
import { lineOf, spokenText, voiceLines } from "@studio/engine/audio/voiceLines";
import { buildManifest } from "@studio/voice";
import { readRefs } from "@studio/voice/refs";
import { video } from "../../traits/video.js";

/** Write a video's voice/manifest.json: one speech job per voice clip, from the script, cast and reference clips. */
export default cmd({
  needs: [video],
  select: "one",
  handler: async (_, { project, ok }) => {
    const load = (rel: string) => import(pathToFileURL(join(project.dir, rel)).href);
    const { SCRIPT } = await load("script/index.ts");
    const { CAST } = await load("script/cast.ts");
    const voiceDir = join(project.dir, "voice");
    const entries = buildManifest(SCRIPT, CAST, readRefs(CAST, voiceDir), { lineOf, spokenText, voiceLines });
    writeFileSync(join(voiceDir, "manifest.json"), JSON.stringify(entries, null, 2) + "\n");
    return ok(`${project.name}/voice/manifest.json: ${entries.length} clips`);
  },
});
