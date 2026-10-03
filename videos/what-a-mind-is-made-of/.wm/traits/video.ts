import { z } from "zod";
import { defineTrait } from "@ldlework/workmark/define";

/** Marker: a project that builds and plays the animated video. */
export const video = defineTrait({ name: "video", schema: z.object({}) });
