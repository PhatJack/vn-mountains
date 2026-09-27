import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function epochToDateTime(epoch?: number | string | null) {
  if (epoch === null || epoch === undefined || epoch === "") return null;

  const n = typeof epoch === "string" ? Number(epoch) : epoch;
  if (Number.isNaN(n)) return null;

  // Assume seconds if epoch has 10 digits, otherwise milliseconds
  const timestamp = n.toString().length === 10 ? n * 1000 : n;
  const date = new Date(timestamp);

  if (!isValid(date)) return null;

  return format(date, "dd/MM/yyyy HH:mm:ss");
}
