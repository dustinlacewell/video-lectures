import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Type-check and build one video's player into its own dist/ (served at /). */
export default cmd({ needs: [video], handler: (_, { sh }) => sh(["pnpm exec tsc --noEmit", "pnpm exec vite build"]) });
