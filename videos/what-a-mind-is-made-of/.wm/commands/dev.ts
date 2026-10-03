import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Run the player with live reload. */
export default cmd({ needs: [video], for: "cognition", interactive: true, handler: (_, { sh }) => sh("pnpm vite") });
