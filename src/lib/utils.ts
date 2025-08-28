import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toPersianNumerals = (text: string | number | undefined | null) => {
  if (text === null || text === undefined) return "";
  const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(text).replace(/[0-9]/g, (w) => persianNumerals[+w]);
};
