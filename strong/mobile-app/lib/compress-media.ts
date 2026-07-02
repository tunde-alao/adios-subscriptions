import {
  manipulateAsync,
  SaveFormat,
  type ImageResult,
} from "expo-image-manipulator";

export interface CompressedMedia {
  uri: string;
  ext: string;
  contentType: string;
}

const IMAGE_MAX_WIDTH = 1080;
const IMAGE_JPEG_QUALITY = 0.7;

export async function compressImage(uri: string): Promise<CompressedMedia> {
  const result: ImageResult = await manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_MAX_WIDTH } }],
    { compress: IMAGE_JPEG_QUALITY, format: SaveFormat.JPEG }
  );

  return {
    uri: result.uri,
    ext: "jpg",
    contentType: "image/jpeg",
  };
}
