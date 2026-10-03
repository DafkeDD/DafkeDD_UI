/**
 * Kleine beeldhulp — verkleint een gekozen afbeelding tot een vierkante
 * data-URL. Gebruikt alleen canvas: geen upload, geen bibliotheek.
 */

export interface SquareImageOptions {
  /** Zijde van het resultaat in pixels. */
  size?: number;
  /** JPEG-kwaliteit tussen 0 en 1. */
  quality?: number;
  type?: "image/jpeg" | "image/png" | "image/webp";
}

/** Snijdt het midden uit een afbeelding en schaalt naar een vierkante data-URL. */
export function toSquareDataUrl(file: File, options: SquareImageOptions = {}): Promise<string> {
  const { size = 160, quality = 0.82, type = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) {
      reject(new Error("Geen afbeelding"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Bestand kon niet gelezen worden"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Afbeelding kon niet geladen worden"));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas niet beschikbaar"));
          return;
        }
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL(type, quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
