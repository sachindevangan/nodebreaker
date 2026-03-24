import { toPng, toSvg } from 'html-to-image';

declare global {
  interface Window {
    __nbFitViewForExport?: () => void;
  }
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function addWatermark(canvasEl: HTMLElement): HTMLDivElement {
  const mark = document.createElement('div');
  mark.textContent = 'Built with NodeBreaker';
  mark.style.position = 'absolute';
  mark.style.right = '14px';
  mark.style.bottom = '10px';
  mark.style.color = '#a1a1aa';
  mark.style.opacity = '0.75';
  mark.style.fontSize = '12px';
  mark.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
  mark.style.pointerEvents = 'none';
  mark.style.zIndex = '9999';
  canvasEl.appendChild(mark);
  return mark;
}

async function prepareCanvasForExport(): Promise<HTMLElement | null> {
  window.__nbFitViewForExport?.();
  await new Promise((resolve) => window.setTimeout(resolve, 360));
  const reactFlowEl = document.querySelector('.react-flow');
  if (!(reactFlowEl instanceof HTMLElement)) return null;
  return reactFlowEl;
}

export async function exportCanvasAsPng(filename = 'nodebreaker-architecture.png'): Promise<boolean> {
  const canvasEl = await prepareCanvasForExport();
  if (!canvasEl) return false;
  const watermark = addWatermark(canvasEl);
  try {
    const dataUrl = await toPng(canvasEl, {
      backgroundColor: '#0f1117',
      pixelRatio: 2,
      cacheBust: true,
      quality: 1,
    });
    downloadDataUrl(dataUrl, filename);
    return true;
  } finally {
    watermark.remove();
  }
}

export async function exportCanvasAsSvg(filename = 'nodebreaker-architecture.svg'): Promise<boolean> {
  const canvasEl = await prepareCanvasForExport();
  if (!canvasEl) return false;
  const watermark = addWatermark(canvasEl);
  try {
    const dataUrl = await toSvg(canvasEl, {
      backgroundColor: '#0f1117',
      cacheBust: true,
      pixelRatio: 2,
    });
    downloadDataUrl(dataUrl, filename);
    return true;
  } finally {
    watermark.remove();
  }
}

