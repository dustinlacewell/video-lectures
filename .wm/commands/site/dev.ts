import { cmd } from "@ldlework/workmark/define";

/** Run the series index with live reload. Video links need site:build + site:preview. */
export default cmd({ interactive: true, handler: (_, { sh }) => sh("pnpm --dir site exec vite") });
