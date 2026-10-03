import { cmd } from "@ldlework/workmark/define";
import { video } from "../traits/video.js";

/** Build the player, then diff its frames, timeline, sounds and text against the original single-file HTML. Diff images go to out/parity. */
export default cmd({ needs: [video], for: "cognition", handler: (_, { sh }) => sh(["pnpm vite build", "node tools/parity.ts"]) });
