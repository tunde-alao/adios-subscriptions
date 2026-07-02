import { File } from "expo-file-system/next";
import { supabase } from "./supabase";

const UPLOAD_TIMEOUT_MS = 30_000;

/**
 * Rejects if the given promise does not settle within `ms`.
 * Prevents the UI from loading forever when a network request hangs.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Uploads a media file (image or video) to a Supabase Storage bucket and returns the path.
 * Store this path in your database, not the full URL.
 */
export async function uploadMedia(
  uri: string,
  bucket: string,
  path: string,
  contentType: string,
  ext: string
): Promise<string> {
  const filePath = `${path}.${ext}`;

  try {
    console.log("[uploadMedia] start", { uri, bucket, filePath, contentType });

    const file = new File(uri);
    const arrayBuffer = await withTimeout(
      file.arrayBuffer(),
      UPLOAD_TIMEOUT_MS,
      "Reading file"
    );

    console.log("[uploadMedia] read file", { bytes: arrayBuffer.byteLength });

    const { data, error } = await withTimeout(
      supabase.storage.from(bucket).upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      }),
      UPLOAD_TIMEOUT_MS,
      "Uploading to storage"
    );

    if (error) {
      console.error("[uploadMedia] supabase upload error", {
        message: error.message,
        name: error.name,
        error,
      });
      throw new Error(`Failed to upload media: ${error.message}`);
    }

    console.log("[uploadMedia] success", { path: data?.path ?? filePath });
    return filePath;
  } catch (err) {
    console.error("[uploadMedia] failed", err);
    throw err;
  }
}

/**
 * Uploads an image to a Supabase Storage bucket and returns the file path.
 * Store this path in your database, not the full URL.
 */
export async function uploadImage(
  uri: string,
  bucket: string,
  path: string
): Promise<string> {
  const extension = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  return uploadMedia(uri, bucket, path, contentType, extension);
}

/**
 * Constructs the public URL for a file stored in Supabase Storage.
 */
export function getStorageUrl(bucket: string, path: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
