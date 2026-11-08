import { CSS_FILTER, type FilterId } from "@/lib/booth/filters";
import { captureSize } from "@/lib/booth/gl";

export function paintLive(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  filter: FilterId,
  mirror: boolean,
) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(rect.width * dpr));
  const h = Math.max(2, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: filter === "anime" });
  if (!ctx) return;
  drawFrame(ctx, video, w, h, filter, mirror, filter === "anime" ? 480 : 0);
}

export function snapshotDataUrl(
  video: HTMLVideoElement,
  filter: FilterId,
  mirror: boolean,
  aspect: number,
): string {
  const { w, h } = captureSize(aspect);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: filter === "anime" });
  if (!ctx) throw new Error("Could not draw the photo");
  drawFrame(ctx, video, w, h, filter, mirror, filter === "anime" ? 720 : 0);
  return canvas.toDataURL("image/jpeg", 0.84);
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number,
  filter: FilterId,
  mirror: boolean,
  animeWidth: number,
) {
  if (filter === "anime" && animeWidth > 0) {
    const sw = Math.min(w, animeWidth);
    const sh = Math.max(2, Math.round(sw / (w / h)));
    const small = document.createElement("canvas");
    small.width = sw;
    small.height = sh;
    const sctx = small.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;
    blitCover(sctx, video, sw, sh, mirror);
    const processed = animePass(sctx.getImageData(0, 0, sw, sh));
    sctx.putImageData(processed, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(small, 0, 0, w, h);
    return;
  }

  ctx.save();
  ctx.filter = CSS_FILTER[filter];
  blitCover(ctx, video, w, h, mirror);
  ctx.restore();
}

function blitCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number,
  mirror: boolean,
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw < 2 || vh < 2) return;
  const videoAspect = vw / vh;
  const canvasAspect = w / h;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;
  if (videoAspect > canvasAspect) {
    sw = vh * canvasAspect;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / canvasAspect;
    sy = (vh - sh) / 2;
  }
  ctx.save();
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
  ctx.restore();
}

function animePass(image: ImageData): ImageData {
  const { width, height, data } = image;
  const count = width * height;
  const luma = new Float32Array(count);
  for (let p = 0; p < count; p++) {
    const i = p * 4;
    luma[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const out = new Uint8ClampedArray(data.length);
  const levels = 4;
  const step = 255 / levels;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      let r = quant(data[i], step);
      let g = quant(data[i + 1], step);
      let b = quant(data[i + 2], step);
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = clamp255(l + (r - l) * 1.4);
      g = clamp255(l + (g - l) * 1.4);
      b = clamp255(l + (b - l) * 1.4);

      let line = 0;
      if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        const tl = luma[p - width - 1];
        const t = luma[p - width];
        const tr = luma[p - width + 1];
        const ml = luma[p - 1];
        const mr = luma[p + 1];
        const bl = luma[p + width - 1];
        const bm = luma[p + width];
        const br = luma[p + width + 1];
        const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
        const gy = -tl - 2 * t - tr + bl + 2 * bm + br;
        const edge = Math.min(1, Math.hypot(gx, gy) / 220);
        line = edge < 0.16 ? 0 : Math.min(1, (edge - 0.16) / 0.34);
      }
      out[i] = r * (1 - line) + 26 * line;
      out[i + 1] = g * (1 - line) + 18 * line;
      out[i + 2] = b * (1 - line) + 20 * line;
      out[i + 3] = 255;
    }
  }
  return new ImageData(out, width, height);
}

function quant(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp255(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}
