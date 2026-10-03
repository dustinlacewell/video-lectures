import { join } from "node:path";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../../traits/video.js";

/** Write the voice manifest, then synthesize every missing or changed clip into voice/clips (loads the TTS model once, ~50 s). */
export default cmd({
  needs: [video],
  for: "cognition",
  handler: async (_, { project, invoke, exec }) => {
    const manifest = await invoke("voice:manifest", {});
    if (manifest.isError) return manifest;
    return exec("uv run render.py", { cwd: join(project.dir, "voice"), timeout: 3_600_000 });
  },
});
