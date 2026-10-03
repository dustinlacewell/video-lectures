import { cmd } from "@ldlework/workmark/define";

/** Build every video and the series index into dist/ (what the Pages workflow deploys). */
export default cmd({ handler: (_, { sh }) => sh("pnpm build:site") });
