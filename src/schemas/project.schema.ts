import type { output } from "zod";
import { object, string } from "zod";

export const ProjectSettingsFormSchema = object({
  installCommand: string(),
  devCommand: string(),
});

export type ProjectSettingsFormSchema = output<
  typeof ProjectSettingsFormSchema
>;
