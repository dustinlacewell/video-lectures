import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Type-check and build the player into dist/. */
export default cmd({ needs: [video], for: "cognition", handler: (_, { sh }) => sh(["pnpm tsc --noEmit", "pnpm vite build"]) });
