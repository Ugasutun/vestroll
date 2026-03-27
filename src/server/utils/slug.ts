/**
 * Generate a URL-safe slug from an organization name
 * 
 * @param name - The organization name to convert to a slug
 * @returns A unique, URL-safe slug with a random suffix
 * 
 * @example
 * generateSlug("Acme Corporation") // "acme-corporation-a1b2c3"
 * generateSlug("Test & Co.") // "test-co-d4e5f6"
 */
export function generateSlug(name: string): string {
  // Convert to lowercase and remove leading/trailing whitespace
  let slug = name.toLowerCase().trim();

  // Replace special characters and spaces with hyphens
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens

  // Generate a random 6-character suffix for uniqueness
  const randomSuffix = generateRandomSuffix(6);

  // Combine slug with random suffix
  return `${slug}-${randomSuffix}`;
}

/**
 * Generate a random alphanumeric suffix
 * 
 * @param length - Length of the random suffix
 * @returns A random alphanumeric string
 */
function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
