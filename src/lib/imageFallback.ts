import type { SyntheticEvent } from 'react';

type ImageKind = 'clinic' | 'doctor';

const LOCAL_FALLBACKS: Record<ImageKind, string> = {
  clinic: '/images/clinic-placeholder.svg',
  doctor: '/images/doctor-placeholder.svg',
};

const INLINE_FALLBACKS: Record<ImageKind, string> = {
  clinic: svgDataUri('Клиника', '#e6f3ff', '#3FA8FF'),
  doctor: svgDataUri('Врач', '#eef7f1', '#2f9e62'),
};

function svgDataUri(label: string, background: string, foreground: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="${background}"/>
      <circle cx="400" cy="250" r="92" fill="${foreground}" opacity="0.18"/>
      <rect x="260" y="365" width="280" height="42" rx="21" fill="${foreground}" opacity="0.18"/>
      <text x="400" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${foreground}">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function imageSrc(src: string | null | undefined, kind: ImageKind) {
  return src?.trim() || LOCAL_FALLBACKS[kind];
}

export function handleImageError(kind: ImageKind) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    if (img.dataset.fallbackStage !== 'local') {
      img.dataset.fallbackStage = 'local';
      img.src = LOCAL_FALLBACKS[kind];
      return;
    }

    if (img.dataset.fallbackStage !== 'inline') {
      img.dataset.fallbackStage = 'inline';
      img.src = INLINE_FALLBACKS[kind];
    }
  };
}
