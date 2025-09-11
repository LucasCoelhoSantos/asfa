export async function loadAndResizeImageAsBase64(options: {
  src: string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  maxWidth?: number;
  maxHeight?: number;
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number; // apenas para jpeg/webp
}): Promise<string> {
  const {
    src,
    crossOrigin = 'anonymous',
    maxWidth = 80,
    maxHeight = 80,
    outputType = 'image/png',
    quality
  } = options;

  return await new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof crossOrigin === 'string') {
      img.crossOrigin = crossOrigin as any;
    }
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = img;
        // Mantém proporção e limita ao máximo informado
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = Math.max(1, Math.floor(width));
        canvas.height = Math.max(1, Math.floor(height));
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = src;
  });
}

export async function loadAsBase64ViaFetch(url: string): Promise<string> {
  const resp = await fetch(url, { mode: 'cors' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const blob = await resp.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
