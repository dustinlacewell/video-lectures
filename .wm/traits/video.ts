import { z } from "zod";
import { defineTrait } from "@ldlework/workmark/define";

/** Marker: a video folder under videos/ that builds and plays one animated video. */
export const video = defineTrait({ name: "video", schema: z.object({}) });
