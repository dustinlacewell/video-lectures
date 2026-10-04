import { join } from "node:path";
import { cmd } from "@ldlework/workmark/define";
import { video } from "../../traits/video.js";

/** Write a video's voice manifest, then synthesize every missing or changed clip into voice/clips (loads the TTS model once, ~50 s). */
export default cmd({
  needs: [video],
  select: "one",
  handler: async (_, { project, workspace, invoke, exec }) => {
    const manifest = await invoke("voice:manifest", { project: project.name });
    if (manifest.isError) return manifest;
    return exec(`uv run render.py --video "${project.dir}"`, { cwd: join(workspace.root, "packages/voice/py"), timeout: 3_600_000 });
  },
});
