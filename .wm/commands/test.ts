import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Run unit tests. */
export default cmd({ needs: [video], for: "cognition", handler: (_, { sh }) => sh("pnpm vitest run") });
