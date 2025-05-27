import { isValidUrl } from "./isValidUrl";

export const normalizeUserUpdate = (updates) => {
  const cleaned = {};

  for (const [key, value] of Object.entries(updates)) {
    cleaned[key] = value === "" ? null : value;
  }

  const urlFields = ["website", "github_url", "linkedin_url", "instagram_url"];
  for (const field of urlFields) {
    if (cleaned[field] && !isValidUrl(cleaned[field])) {
      throw new Error(`Invalid URL format for ${field}`);
    }
  }

  if (cleaned.email && !/\S+@\S+\.\S+/.test(cleaned.email)) {
    throw new Error("Invalid email format.");
  }

  return cleaned;
};
