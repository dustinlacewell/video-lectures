import { cmd } from "@ldlework/workmark/define";

/** Serve the built dist/ (run site:build first) as Pages would. */
export default cmd({ interactive: true, handler: (_, { sh }) => sh("pnpm --dir site exec vite preview") });
