import { supabaseAdmin } from "./supabase.js";

const TASK_IMAGES_BUCKET = "task-images";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function getTaskImageUrl(
  imagePath: string | null
): Promise<string | null> {
  if (!imagePath) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(TASK_IMAGES_BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("Failed to create signed URL for task image:", error);
    return null;
  }
  return data.signedUrl;
}

export { TASK_IMAGES_BUCKET };
