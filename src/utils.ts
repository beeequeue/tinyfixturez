import path from "pathe"

export const relativeToCwd = (input: string): string => path.relative(process.cwd(), input)
