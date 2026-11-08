import { FILTER_INDEX, type FilterId } from "@/lib/booth/filters";

const VERT = `
attribute vec2 aPos;
attribute vec2 aUv;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform vec2 uTexel;
uniform float uFilter;
uniform float uMirror;
uniform float uTime;

vec2 toTex(vec2 uv) {
  vec2 c = (uv - 0.5) * uCover + 0.5;
  if (uMirror > 0.5) c.x = 1.0 - c.x;
  return c;
}

vec3 sampleAt(vec2 uv) {
  return texture2D(uTex, toTex(uv)).rgb;
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec3 src = sampleAt(vUv);
  vec3 col = src;

  if (uFilter < 0.5) {
    col = src;
  } else if (uFilter < 1.5) {
    col = pow(max(src, 0.0), vec3(0.92));
    col.r *= 1.08;
    col.g *= 1.02;
    col.b *= 0.86;
    float l = luma(col);
    col = mix(vec3(l), col, 1.12);
    vec2 p = vUv * 2.0 - 1.0;
    float vig = smoothstep(1.22, 0.28, length(p));
    col *= mix(0.7, 1.0, vig);
    float n = fract(sin(dot(gl_FragCoord.xy + uTime * 37.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.045;
  } else if (uFilter < 2.5) {
    col = src * 1.14 + 0.05;
    col.r *= 0.9;
    col.g *= 0.98;
    col.b *= 1.12;
    float l = luma(col);
    col = mix(vec3(l), col, 0.82);
    vec2 p = vUv * 2.0 - 1.0;
    float vig = smoothstep(1.3, 0.15, length(p));
    col = mix(col, vec3(0.78, 0.86, 0.95), (1.0 - vig) * 0.22);
  } else if (uFilter < 3.5) {
    float l = luma(src);
    l = smoothstep(0.06, 0.94, l);
    col = vec3(pow(l, 0.88));
  } else if (uFilter < 4.5) {
    col = (src - 0.5) * 1.22 + 0.5;
    float l = luma(col);
    col = mix(vec3(l), col, 1.55);
  } else {
    vec3 graded = clamp((src - 0.5) * 1.18 + 0.5, 0.0, 1.0);
    float levels = 5.0;
    vec3 q = clamp(floor(graded * levels + 0.5) / levels, 0.0, 1.0);
    float l = luma(q);
    q = clamp(mix(vec3(l), q, 1.42), 0.0, 1.0);

    float tl = luma(sampleAt(vUv + vec2(-uTexel.x, uTexel.y)));
    float t = luma(sampleAt(vUv + vec2(0.0, uTexel.y)));
    float tr = luma(sampleAt(vUv + vec2(uTexel.x, uTexel.y)));
    float ml = luma(sampleAt(vUv + vec2(-uTexel.x, 0.0)));
    float mr = luma(sampleAt(vUv + vec2(uTexel.x, 0.0)));
    float bl = luma(sampleAt(vUv + vec2(-uTexel.x, -uTexel.y)));
    float b = luma(sampleAt(vUv + vec2(0.0, -uTexel.y)));
    float br = luma(sampleAt(vUv + vec2(uTexel.x, -uTexel.y)));
    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    float edge = clamp(length(vec2(gx, gy)) * 1.35, 0.0, 1.0);
    float line = smoothstep(0.14, 0.48, edge);
    col = mix(q, vec3(0.1, 0.07, 0.08), line);
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

type GL = WebGLRenderingContext;

class GLPipe {
  readonly gl: GL;
  private program: WebGLProgram;
  private tex: WebGLTexture;
  private buf: WebGLBuffer;
  private loc: {
    cover: WebGLUniformLocation | null;
    texel: WebGLUniformLocation | null;
    filter: WebGLUniformLocation | null;
    mirror: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
  };

  private constructor(gl: GL, program: WebGLProgram, tex: WebGLTexture, buf: WebGLBuffer) {
    this.gl = gl;
    this.program = program;
    this.tex = tex;
    this.buf = buf;
    this.loc = {
      cover: gl.getUniformLocation(program, "uCover"),
      texel: gl.getUniformLocation(program, "uTexel"),
      filter: gl.getUniformLocation(program, "uFilter"),
      mirror: gl.getUniformLocation(program, "uMirror"),
      time: gl.getUniformLocation(program, "uTime"),
    };
  }

  static tryCreate(canvas: HTMLCanvasElement, preserve: boolean): GLPipe | null {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: preserve,
    });
    if (!gl) return null;
    const program = buildProgram(gl, VERT, FRAG);
    if (!program) return null;
    const tex = gl.createTexture();
    const buf = gl.createBuffer();
    if (!tex || !buf) return null;

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    return new GLPipe(gl, program, tex, buf);
  }

  draw(video: HTMLVideoElement, filter: FilterId, mirror: boolean, time: number) {
    const { gl } = this;
    const canvas = gl.canvas as HTMLCanvasElement;
    if (canvas.width < 2 || canvas.height < 2 || video.videoWidth < 2) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    const cover = coverScale(video.videoWidth, video.videoHeight, canvas.width, canvas.height);
    const span = Math.max(canvas.width, canvas.height) / 260;
    gl.uniform2f(this.loc.cover, cover[0], cover[1]);
    gl.uniform2f(this.loc.texel, span / canvas.width, span / canvas.height);
    gl.uniform1f(this.loc.filter, FILTER_INDEX[filter]);
    gl.uniform1f(this.loc.mirror, mirror ? 1 : 0);
    gl.uniform1f(this.loc.time, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const { gl } = this;
    gl.deleteTexture(this.tex);
    gl.deleteBuffer(this.buf);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export class BoothRenderer {
  private display: GLPipe | null;
  private captureCanvas: HTMLCanvasElement | null = null;
  private capturePipe: GLPipe | null = null;
  readonly ok: boolean;

  constructor(displayCanvas: HTMLCanvasElement) {
    this.display = GLPipe.tryCreate(displayCanvas, false);
    this.ok = this.display !== null;
  }

  drawDisplay(video: HTMLVideoElement, filter: FilterId, mirror: boolean) {
    const canvas = this.display?.gl.canvas as HTMLCanvasElement | undefined;
    if (!canvas || !this.display) return;
    resizeToClient(canvas);
    this.display.draw(video, filter, mirror, performance.now() / 1000);
  }

  snapshot(video: HTMLVideoElement, filter: FilterId, mirror: boolean, aspect: number): string {
    if (!this.capturePipe) {
      this.captureCanvas = document.createElement("canvas");
      this.capturePipe = GLPipe.tryCreate(this.captureCanvas, true);
    }
    if (!this.capturePipe || !this.captureCanvas) {
      throw new Error("Filter renderer is unavailable");
    }
    const { w, h } = captureSize(aspect);
    this.captureCanvas.width = w;
    this.captureCanvas.height = h;
    this.capturePipe.draw(video, filter, mirror, performance.now() / 1000);
    return this.captureCanvas.toDataURL("image/jpeg", 0.84);
  }

  dispose() {
    this.display?.dispose();
    this.capturePipe?.dispose();
    this.display = null;
    this.capturePipe = null;
  }
}

function coverScale(
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): [number, number] {
  const videoAspect = videoW / videoH;
  const canvasAspect = canvasW / canvasH;
  if (canvasAspect > videoAspect) return [1, videoAspect / canvasAspect];
  return [canvasAspect / videoAspect, 1];
}

export function captureSize(aspect: number): { w: number; h: number } {
  const safe = Number.isFinite(aspect) && aspect > 0.2 ? aspect : 3 / 4;
  const maxW = 1440;
  const maxH = 1600;
  let w = maxW;
  let h = Math.round(w / safe);
  if (h > maxH) {
    h = maxH;
    w = Math.round(h * safe);
  }
  return { w: Math.max(2, w), h: Math.max(2, h) };
}

function resizeToClient(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(rect.width * dpr));
  const h = Math.max(2, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function buildProgram(gl: GL, vert: string, frag: string): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.bindAttribLocation(program, 1, "aUv");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function compile(gl: GL, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
