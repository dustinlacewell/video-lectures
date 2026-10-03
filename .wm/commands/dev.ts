import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Run one video's player with live reload. */
export default cmd({ needs: [video], interactive: true, handler: (_, { sh }) => sh("pnpm exec vite") });
