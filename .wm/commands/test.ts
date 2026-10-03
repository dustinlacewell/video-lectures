import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Run a video's unit tests. */
export default cmd({ needs: [video], handler: (_, { sh }) => sh("pnpm exec vitest run") });
