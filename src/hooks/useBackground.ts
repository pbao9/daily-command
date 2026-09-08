import { useCallback, useState } from 'react';
import type { Settings } from '../types';
import { downscaleImage, fileToDataUrl } from '../utils/image';

interface UseBackgroundResult {
  error: string | null;
  uploading: boolean;
  uploadBackground: (file: File) => Promise<{ ok: boolean }>;
  removeBackground: () => Promise<void>;
}

/**
 * Wraps background-image upload/removal on top of useSettings. The image
 * itself lives on settings.backgroundImage; this hook only adds the
 * resize + error-handling behavior around writing it.
 */
export function useBackground(
  updateSettings: (partial: Partial<Settings>) => Promise<void>,
): UseBackgroundResult {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadBackground = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file.');
        return { ok: false };
      }
      setUploading(true);
      try {
        const rawDataUrl = await fileToDataUrl(file);
        const resized = await downscaleImage(rawDataUrl);
        await updateSettings({ backgroundImage: resized });
        return { ok: true };
      } catch (err) {
        const message =
          err instanceof Error && err.message.toLowerCase().includes('quota')
            ? "Couldn't save background: storage limit reached. Try a smaller image."
            : 'Could not read that image. Please try another file.';
        setError(message);
        return { ok: false };
      } finally {
        setUploading(false);
      }
    },
    [updateSettings],
  );

  const removeBackground = useCallback(async () => {
    setError(null);
    await updateSettings({ backgroundImage: undefined });
  }, [updateSettings]);

  return { error, uploading, uploadBackground, removeBackground };
}
