import { z } from "zod";

const DANGEROUS_SCHEMES = ["javascript:", "data:", "file:", "vbscript:"];
const PRIVATE_IP_PATTERNS = [
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i,
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
  /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}/i,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}/i,
  /^https?:\/\/169\.254\.\d{1,3}\.\d{1,3}/i,
];

export const urlSchema = z
  .string()
  .url("Format URL tidak valid")
  .refine(
    (url) => {
      const lower = url.toLowerCase();
      return DANGEROUS_SCHEMES.every((scheme) => !lower.startsWith(scheme));
    },
    { message: "Skema URL ini tidak diizinkan (javascript:, data:, dll)" }
  )
  .refine(
    (url) => {
      return !PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(url));
    },
    { message: "Alamat IP privat tidak diizinkan" }
  );

export const slugSchema = z
  .string()
  .min(3, "Slug minimal 3 karakter")
  .max(50, "Slug maksimal 50 karakter")
  .regex(/^[a-z0-9-_]+$/i, "Slug hanya boleh berisi huruf, angka, tanda hubung, dan underscore");
