import sharp from "sharp";
import { logger } from "./logger";

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 80,
  format: "jpeg",
};

export async function compressImage(
  imageBuffer: Buffer,
  options: CompressOptions = {}
): Promise<Buffer> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let transformer = sharp(imageBuffer).resize(opts.maxWidth, opts.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    }) as any;

    if (opts.format === "jpeg") {
      transformer = transformer.jpeg({ quality: opts.quality });
    } else if (opts.format === "webp") {
      transformer = transformer.webp({ quality: opts.quality });
    } else {
      transformer = transformer.png();
    }

    const compressed = await transformer.toBuffer();
    const originalSize = imageBuffer.length;
    const compressedSize = compressed.length;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    logger.info(
      { originalSize, compressedSize, ratio: `${ratio}%` },
      "Image compressed"
    );

    return compressed;
  } catch (error) {
    logger.error({ error }, "Image compression failed");
    throw new Error(`Image compression failed: ${error}`);
  }
}

export async function compressImageBase64(
  base64: string,
  options: CompressOptions = {}
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const compressed = await compressImage(buffer, options);
  return compressed.toString("base64");
}
