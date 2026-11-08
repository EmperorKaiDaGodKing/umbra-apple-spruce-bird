import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Trash2, c as LoaderCircle, d as CameraOff, f as Aperture, i as TriangleAlert, l as Download, n as VolumeX, o as SwitchCamera, r as Volume2, s as ShieldOff, t as X, u as Camera } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bw4E0W_n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	{
		id: "clean",
		label: "Clean",
		blurb: "No grade"
	},
	{
		id: "film",
		label: "Warm Film",
		blurb: "Gold and grain"
	},
	{
		id: "flash",
		label: "Cool Flash",
		blurb: "Bright and airy"
	},
	{
		id: "noir",
		label: "Noir",
		blurb: "Hard black and white"
	},
	{
		id: "pop",
		label: "Pop",
		blurb: "Sticker color"
	},
	{
		id: "anime",
		label: "Anime",
		blurb: "Cel color, ink lines"
	}
];
var FILTER_INDEX = {
	clean: 0,
	film: 1,
	flash: 2,
	noir: 3,
	pop: 4,
	anime: 5
};
function filterLabel(id) {
	return FILTERS.find((filter) => filter.id === id)?.label ?? "Clean";
}
var CSS_FILTER = {
	clean: "none",
	film: "sepia(0.45) contrast(1.08) saturate(1.15)",
	flash: "brightness(1.16) contrast(1.04) saturate(0.72)",
	noir: "grayscale(1) contrast(1.28) brightness(1.04)",
	pop: "saturate(1.65) contrast(1.16)",
	anime: "saturate(1.4) contrast(1.45)"
};
function isFilterId(value) {
	return typeof value === "string" && value in FILTER_INDEX;
}
var VERT = `
attribute vec2 aPos;
attribute vec2 aUv;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
var FRAG = `
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
var GLPipe = class GLPipe {
	gl;
	program;
	tex;
	buf;
	loc;
	constructor(gl, program, tex, buf) {
		this.gl = gl;
		this.program = program;
		this.tex = tex;
		this.buf = buf;
		this.loc = {
			cover: gl.getUniformLocation(program, "uCover"),
			texel: gl.getUniformLocation(program, "uTexel"),
			filter: gl.getUniformLocation(program, "uFilter"),
			mirror: gl.getUniformLocation(program, "uMirror"),
			time: gl.getUniformLocation(program, "uTime")
		};
	}
	static tryCreate(canvas, preserve) {
		const gl = canvas.getContext("webgl", {
			alpha: false,
			antialias: false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: preserve
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
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
			0,
			0,
			0,
			255
		]));
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			0,
			0,
			1,
			-1,
			1,
			0,
			-1,
			1,
			0,
			1,
			1,
			1,
			1,
			1
		]), gl.STATIC_DRAW);
		return new GLPipe(gl, program, tex, buf);
	}
	draw(video, filter, mirror, time) {
		const { gl } = this;
		const canvas = gl.canvas;
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
};
var BoothRenderer = class {
	display;
	captureCanvas = null;
	capturePipe = null;
	ok;
	constructor(displayCanvas) {
		this.display = GLPipe.tryCreate(displayCanvas, false);
		this.ok = this.display !== null;
	}
	drawDisplay(video, filter, mirror) {
		const canvas = this.display?.gl.canvas;
		if (!canvas || !this.display) return;
		resizeToClient(canvas);
		this.display.draw(video, filter, mirror, performance.now() / 1e3);
	}
	snapshot(video, filter, mirror, aspect) {
		if (!this.capturePipe) {
			this.captureCanvas = document.createElement("canvas");
			this.capturePipe = GLPipe.tryCreate(this.captureCanvas, true);
		}
		if (!this.capturePipe || !this.captureCanvas) throw new Error("Filter renderer is unavailable");
		const { w, h } = captureSize(aspect);
		this.captureCanvas.width = w;
		this.captureCanvas.height = h;
		this.capturePipe.draw(video, filter, mirror, performance.now() / 1e3);
		return this.captureCanvas.toDataURL("image/jpeg", .84);
	}
	dispose() {
		this.display?.dispose();
		this.capturePipe?.dispose();
		this.display = null;
		this.capturePipe = null;
	}
};
function coverScale(videoW, videoH, canvasW, canvasH) {
	const videoAspect = videoW / videoH;
	const canvasAspect = canvasW / canvasH;
	if (canvasAspect > videoAspect) return [1, videoAspect / canvasAspect];
	return [canvasAspect / videoAspect, 1];
}
function captureSize(aspect) {
	const safe = Number.isFinite(aspect) && aspect > .2 ? aspect : 3 / 4;
	const maxW = 1440;
	const maxH = 1600;
	let w = maxW;
	let h = Math.round(w / safe);
	if (h > maxH) {
		h = maxH;
		w = Math.round(h * safe);
	}
	return {
		w: Math.max(2, w),
		h: Math.max(2, h)
	};
}
function resizeToClient(canvas) {
	const rect = canvas.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const w = Math.max(2, Math.round(rect.width * dpr));
	const h = Math.max(2, Math.round(rect.height * dpr));
	if (canvas.width !== w || canvas.height !== h) {
		canvas.width = w;
		canvas.height = h;
	}
}
function buildProgram(gl, vert, frag) {
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
function compile(gl, type, source) {
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
function paintLive(canvas, video, filter, mirror) {
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
function snapshotDataUrl(video, filter, mirror, aspect) {
	const { w, h } = captureSize(aspect);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d", { willReadFrequently: filter === "anime" });
	if (!ctx) throw new Error("Could not draw the photo");
	drawFrame(ctx, video, w, h, filter, mirror, filter === "anime" ? 720 : 0);
	return canvas.toDataURL("image/jpeg", .84);
}
function drawFrame(ctx, video, w, h, filter, mirror, animeWidth) {
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
function blitCover(ctx, video, w, h, mirror) {
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
function animePass(image) {
	const { width, height, data } = image;
	const count = width * height;
	const luma = new Float32Array(count);
	for (let p = 0; p < count; p++) {
		const i = p * 4;
		luma[p] = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2];
	}
	const out = new Uint8ClampedArray(data.length);
	const step = 255 / 4;
	for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
		const p = y * width + x;
		const i = p * 4;
		let r = quant(data[i], step);
		let g = quant(data[i + 1], step);
		let b = quant(data[i + 2], step);
		const l = .299 * r + .587 * g + .114 * b;
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
			line = edge < .16 ? 0 : Math.min(1, (edge - .16) / .34);
		}
		out[i] = r * (1 - line) + 26 * line;
		out[i + 1] = g * (1 - line) + 18 * line;
		out[i + 2] = b * (1 - line) + 20 * line;
		out[i + 3] = 255;
	}
	return new ImageData(out, width, height);
}
function quant(value, step) {
	return Math.round(value / step) * step;
}
function clamp255(value) {
	return value < 0 ? 0 : value > 255 ? 255 : value;
}
var SHOTS_KEY = "popbooth.shots.v1";
var PREFS_KEY = "popbooth.prefs.v1";
var DEFAULT_PREFS = {
	filter: "clean",
	countdown: 3,
	muted: false
};
function loadShots() {
	try {
		const raw = localStorage.getItem(SHOTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isShot).slice(0, 8);
	} catch {
		return [];
	}
}
function saveShots(shots) {
	const trimmed = shots.slice(0, 8);
	try {
		localStorage.setItem(SHOTS_KEY, JSON.stringify(trimmed));
	} catch {
		try {
			localStorage.setItem(SHOTS_KEY, JSON.stringify(trimmed.slice(0, 3)));
		} catch {}
	}
}
function loadPrefs() {
	try {
		const raw = localStorage.getItem(PREFS_KEY);
		if (!raw) return DEFAULT_PREFS;
		const parsed = JSON.parse(raw);
		return {
			filter: isFilterId(parsed.filter) ? parsed.filter : DEFAULT_PREFS.filter,
			countdown: parsed.countdown === 0 || parsed.countdown === 3 || parsed.countdown === 5 ? parsed.countdown : DEFAULT_PREFS.countdown,
			muted: Boolean(parsed.muted)
		};
	} catch {
		return DEFAULT_PREFS;
	}
}
function savePrefs(prefs) {
	try {
		localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
	} catch {}
}
function isShot(value) {
	if (!value || typeof value !== "object") return false;
	const shot = value;
	return typeof shot.id === "string" && typeof shot.src === "string" && shot.src.startsWith("data:image/") && isFilterId(shot.filter) && typeof shot.createdAt === "number";
}
var STATE_COPY = {
	idle: {
		title: "Ready when you are",
		body: "The shutter asks for your camera. Photos stay on this device."
	},
	requesting: {
		title: "Asking for the camera",
		body: "Allow access when the browser asks. You can stop it anytime."
	},
	denied: {
		title: "Camera is blocked",
		body: "Set Camera to Allow for this site in the address bar, then hit the shutter again."
	},
	missing: {
		title: "No camera found",
		body: "Plug one in, or open Popbooth on a phone or laptop that has a camera."
	},
	busy: {
		title: "Camera is busy",
		body: "Another tab or app is using it. Close that, then try again."
	},
	unsupported: {
		title: "Camera isn't available",
		body: "This browser can't open a camera here. Try Chrome, Safari, or Firefox."
	}
};
var PILL = {
	idle: "Ready",
	requesting: "Asking",
	live: "Live",
	denied: "Blocked",
	missing: "No camera",
	busy: "In use",
	unsupported: "Unavailable"
};
function PhotoBooth() {
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const rendererRef = (0, import_react.useRef)(null);
	const runRef = (0, import_react.useRef)(0);
	const busyRef = (0, import_react.useRef)(false);
	const shutterRef = (0, import_react.useRef)(() => {});
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [facing, setFacing] = (0, import_react.useState)("user");
	const [canFlip, setCanFlip] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("clean");
	const [countdown, setCountdown] = (0, import_react.useState)(3);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [shots, setShots] = (0, import_react.useState)([]);
	const [count, setCount] = (0, import_react.useState)(null);
	const [flashKey, setFlashKey] = (0, import_react.useState)(0);
	const [holdSrc, setHoldSrc] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [glOk, setGlOk] = (0, import_react.useState)(false);
	const statusRef = (0, import_react.useRef)(status);
	const facingRef = (0, import_react.useRef)(facing);
	const filterRef = (0, import_react.useRef)(filter);
	const countdownRef = (0, import_react.useRef)(countdown);
	const mutedRef = (0, import_react.useRef)(muted);
	const countRef = (0, import_react.useRef)(count);
	statusRef.current = status;
	facingRef.current = facing;
	filterRef.current = filter;
	countdownRef.current = countdown;
	mutedRef.current = muted;
	countRef.current = count;
	(0, import_react.useEffect)(() => {
		const prefs = loadPrefs();
		setFilter(prefs.filter);
		setCountdown(prefs.countdown);
		setMuted(prefs.muted);
		setShots(loadShots());
	}, []);
	(0, import_react.useEffect)(() => {
		if (status !== "live") return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const renderer = new BoothRenderer(canvas);
		rendererRef.current = renderer;
		setGlOk(renderer.ok);
		return () => {
			renderer.dispose();
			if (rendererRef.current === renderer) rendererRef.current = null;
			setGlOk(false);
		};
	}, [status]);
	(0, import_react.useEffect)(() => {
		let raf = 0;
		let lastAnime = 0;
		const loop = (time) => {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			if (statusRef.current === "live" && video && canvas && video.readyState >= 2 && video.videoWidth > 1) {
				const mirror = facingRef.current === "user";
				const current = filterRef.current;
				const renderer = rendererRef.current;
				if (renderer?.ok) renderer.drawDisplay(video, current, mirror);
				else if (current === "anime" && time - lastAnime > 90) {
					lastAnime = time;
					paintLive(canvas, video, current, mirror);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);
	(0, import_react.useEffect)(() => {
		let gone = false;
		(async () => {
			if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
				if (!gone) setStatus("unsupported");
				return;
			}
			try {
				const perm = await navigator.permissions.query({ name: "camera" });
				if (!gone && perm.state === "denied") setStatus("denied");
			} catch {}
		})();
		return () => {
			gone = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!notice) return;
		const id = window.setTimeout(() => setNotice(null), 3200);
		return () => window.clearTimeout(id);
	}, [notice]);
	(0, import_react.useEffect)(() => {
		return () => {
			runRef.current += 1;
			streamRef.current?.getTracks().forEach((track) => track.stop());
		};
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if (event.code !== "Space") return;
			const tag = event.target?.tagName;
			if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") return;
			event.preventDefault();
			shutterRef.current();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	function rememberPrefs(next) {
		const prefs = {
			filter: next.filter ?? filter,
			countdown: next.countdown ?? countdown,
			muted: next.muted ?? muted
		};
		if (next.filter) setFilter(next.filter);
		if (next.countdown !== void 0) setCountdown(next.countdown);
		if (next.muted !== void 0) setMuted(next.muted);
		savePrefs(prefs);
	}
	async function openCamera(nextFacing, flip) {
		if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
			setStatus("unsupported");
			return;
		}
		setStatus("requesting");
		setNotice(null);
		const previous = streamRef.current;
		try {
			let video = {
				facingMode: { ideal: nextFacing },
				width: { ideal: 1280 },
				height: { ideal: 720 }
			};
			if (flip) {
				const videos = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
				const currentId = previous?.getVideoTracks()[0]?.getSettings().deviceId;
				const other = videos.find((device) => device.deviceId && device.deviceId !== currentId);
				if (other) video = {
					deviceId: { exact: other.deviceId },
					width: { ideal: 1280 },
					height: { ideal: 720 }
				};
			}
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video
			});
			const track = stream.getVideoTracks()[0];
			const newId = track?.getSettings().deviceId;
			const oldId = previous?.getVideoTracks()[0]?.getSettings().deviceId;
			if (flip && previous && newId && oldId && newId === oldId) {
				stream.getTracks().forEach((item) => item.stop());
				setStatus("live");
				setCanFlip(false);
				setNotice("Only one camera is available.");
				return;
			}
			previous?.getTracks().forEach((item) => item.stop());
			streamRef.current = stream;
			const element = videoRef.current;
			if (element) {
				element.srcObject = stream;
				await element.play();
			}
			const reported = track?.getSettings().facingMode;
			const facingNow = reported === "environment" || reported === "user" ? reported : nextFacing;
			facingRef.current = facingNow;
			setFacing(facingNow);
			setStatus("live");
			const videos = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
			setCanFlip(videos.length > 1 || navigator.maxTouchPoints > 1);
		} catch (error) {
			if (flip && previous && previous.getTracks().some((track) => track.readyState === "live")) {
				setStatus("live");
				setNotice("Couldn't switch cameras.");
				return;
			}
			previous?.getTracks().forEach((track) => track.stop());
			if (streamRef.current === previous) streamRef.current = null;
			setStatus(statusFromError(error));
		}
	}
	async function takePhoto() {
		const video = videoRef.current;
		if (!video || video.readyState < 2 || video.videoWidth < 2) {
			setNotice("Camera is still warming up.");
			return;
		}
		busyRef.current = true;
		setFlashKey((key) => key + 1);
		beep(180, .12, mutedRef.current);
		try {
			const frame = frameRef.current;
			const aspect = frame && frame.clientHeight > 0 ? frame.clientWidth / frame.clientHeight : 3 / 4;
			const mirror = facingRef.current === "user";
			const current = filterRef.current;
			const renderer = rendererRef.current;
			const src = renderer && renderer.ok ? renderer.snapshot(video, current, mirror, aspect) : snapshotDataUrl(video, current, mirror, aspect);
			const shot = {
				id: crypto.randomUUID(),
				src,
				filter: current,
				createdAt: Date.now()
			};
			setShots((prev) => {
				const next = [shot, ...prev].slice(0, 8);
				saveShots(next);
				return next;
			});
			setHoldSrc(src);
			window.setTimeout(() => {
				setHoldSrc((currentSrc) => currentSrc === src ? null : currentSrc);
			}, 900);
			setNotice("Saved to your strip.");
		} catch {
			setNotice("Couldn't save that frame. Try again.");
		} finally {
			busyRef.current = false;
		}
	}
	async function onShutter() {
		if (statusRef.current !== "live") {
			await openCamera(facingRef.current, false);
			return;
		}
		if (countRef.current !== null) {
			runRef.current += 1;
			countRef.current = null;
			setCount(null);
			return;
		}
		if (busyRef.current) return;
		const len = countdownRef.current;
		const run = ++runRef.current;
		if (len > 0) {
			for (let n = len; n >= 1; n--) {
				if (runRef.current !== run || statusRef.current !== "live") {
					countRef.current = null;
					setCount(null);
					return;
				}
				countRef.current = n;
				setCount(n);
				beep(n === 1 ? 880 : 620, .08, mutedRef.current);
				await wait(1e3);
			}
			if (runRef.current !== run || statusRef.current !== "live") {
				countRef.current = null;
				setCount(null);
				return;
			}
			countRef.current = null;
			setCount(null);
		}
		await takePhoto();
	}
	shutterRef.current = () => {
		onShutter();
	};
	function removeShot(id) {
		setShots((prev) => {
			const next = prev.filter((shot) => shot.id !== id);
			saveShots(next);
			return next;
		});
		setActiveId(null);
	}
	const active = shots.find((shot) => shot.id === activeId) ?? null;
	const showCssVideo = status === "live" && !glOk && filter !== "anime";
	const latest = shots[0];
	const shutterLabel = status !== "live" ? "Open camera" : count !== null ? "Cancel countdown" : "Take photo";
	const shutterHint = status === "requesting" ? "Waiting for permission…" : status !== "live" ? "Tap the shutter to open the camera" : count !== null ? "Tap the shutter to cancel" : countdown === 0 ? "Tap the shutter. No countdown." : `Tap the shutter. ${countdown} second countdown.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-none tracking-wide",
					children: "Popbooth"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "A sticker booth for your webcam"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "inline-flex items-center gap-2 rounded-full bg-booth px-3 py-2 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-2.5 w-2.5 rounded-full " + (status === "live" ? "live-dot bg-gold" : status === "idle" || status === "requesting" ? "bg-muted" : "bg-shutter"),
						"aria-hidden": true
					}), PILL[status]]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: status === "live" ? "Camera is live" : STATE_COPY[status].title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "assertive",
				children: count !== null ? `Countdown ${count}` : ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 min-w-0 flex-1 flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: frameRef,
							className: "booth-frame relative min-h-0 flex-1 rounded-3xl p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-full overflow-hidden rounded-2xl bg-ink",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
										ref: videoRef,
										playsInline: true,
										muted: true,
										autoPlay: true,
										className: "absolute inset-0 h-full w-full object-cover " + (showCssVideo ? "" : "invisible ") + (showCssVideo && facing === "user" ? "mirror-x" : ""),
										style: showCssVideo ? { filter: CSS_FILTER[filter] } : void 0
									}),
									status === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
										ref: canvasRef,
										className: "absolute inset-0 h-full w-full " + (glOk || filter === "anime" ? "" : "invisible")
									}),
									status !== "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatePanel, { status }),
									status === "live" && count !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pointer-events-none absolute inset-0 grid place-items-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "count-num text-8xl leading-none",
											children: count
										}, count)
									}),
									status === "live" && !holdSrc && count === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pointer-events-none absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-sm font-semibold",
										children: filterLabel(filter)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pointer-events-none absolute inset-x-3 bottom-3 text-center text-sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-ink/75 px-3 py-1",
											children: facing === "user" ? "Front camera · mirrored" : "Rear camera · not mirrored"
										})
									})] }),
									holdSrc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: holdSrc,
										alt: "",
										className: "absolute inset-0 h-full w-full object-cover"
									}),
									flashKey > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flash-overlay absolute inset-0",
										"aria-hidden": true
									}, flashKey),
									notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										role: "status",
										className: "absolute bottom-14 left-1/2 z-20 max-w-xs -translate-x-1/2 rounded-full bg-gold px-3 py-2 text-center text-sm font-semibold text-ink",
										children: notice
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {
								filter,
								countdown,
								muted,
								idPrefix: "hand",
								onFilter: (id) => rememberPrefs({ filter: id }),
								onCountdown: (len) => rememberPrefs({ countdown: len }),
								onMuted: (next) => rememberPrefs({ muted: next })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										label: canFlip ? "Flip camera" : "Flip camera unavailable",
										disabled: !canFlip || status !== "live" || count !== null,
										onClick: () => {
											openCamera(facing === "user" ? "environment" : "user", true);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, {
											className: "size-6",
											"aria-hidden": true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": shutterLabel,
										disabled: status === "requesting",
										onClick: () => {
											onShutter();
										},
										className: "grid h-20 w-20 place-items-center rounded-full bg-gold p-1.5 transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-full w-full place-items-center rounded-full bg-shutter text-ink",
											children: status === "requesting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
												className: "size-8 animate-spin",
												"aria-hidden": true
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aperture, {
												className: "size-8",
												"aria-hidden": true
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										label: "Download latest shot",
										disabled: !latest,
										onClick: () => {
											if (latest) downloadShot(latest);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
											className: "size-6",
											"aria-hidden": true
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-center text-sm text-muted",
								children: shutterHint
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "strip-rail min-w-0 shrink-0 rounded-2xl px-5 py-3 text-ink",
							"aria-label": "Recent shots",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg leading-none",
									children: "Strip"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-booth",
									children: shots.length === 0 ? "Empty" : `${shots.length} on this device`
								})]
							}), shots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-2 text-sm text-booth",
								children: "Shots land here after the flash. Nothing is uploaded."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex gap-2 overflow-x-auto pb-1",
								children: shots.map((shot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setActiveId(shot.id),
										className: "w-16 overflow-hidden rounded-lg transition-transform duration-150 ease-out active:scale-[0.96] " + (shot.id === latest?.id ? "ring-2 ring-gold" : "ring-2 ring-transparent"),
										"aria-label": `Open ${filterLabel(shot.filter)} shot`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: shot.src,
											alt: "",
											className: "aspect-3/4 w-full object-cover"
										})
									})
								}, shot.id))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-72 shrink-0 flex-col lg:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col rounded-3xl bg-booth p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {
							filter,
							countdown,
							muted,
							stacked: true,
							idPrefix: "desk",
							onFilter: (id) => rememberPrefs({ filter: id }),
							onCountdown: (len) => rememberPrefs({ countdown: len }),
							onMuted: (next) => rememberPrefs({ muted: next })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-muted",
							children: "Pick a look, count it down, then hit the shutter. Anime draws flat cel color and ink lines while you pose. The download matches the preview."
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: active !== null,
				onOpenChange: (open) => {
					if (!open) setActiveId(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4 focus:outline-none",
					children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl bg-cream p-3 text-ink",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3 px-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "font-display text-2xl leading-none",
									children: filterLabel(active.filter)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "mt-1 text-sm text-booth",
									children: formatWhen(active.createdAt)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
									type: "button",
									"aria-label": "Close",
									className: "grid h-11 w-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-150 ease-out active:scale-[0.96]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										className: "size-5",
										"aria-hidden": true
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: active.src,
								alt: "",
								className: "mt-3 w-full rounded-2xl"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => downloadShot(active),
									className: "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-shutter font-semibold text-ink transition-transform duration-150 ease-out active:scale-[0.96]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-4",
										"aria-hidden": true
									}), "Download"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => removeShot(active.id),
									className: "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink font-semibold text-cream transition-transform duration-150 ease-out active:scale-[0.96]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-4",
										"aria-hidden": true
									}), "Delete"]
								})]
							})
						]
					})
				})] })
			})
		]
	});
}
function Controls({ filter, countdown, muted, stacked = false, idPrefix, onFilter, onCountdown, onMuted }) {
	const countdownId = `${idPrefix}-countdown`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm font-semibold text-muted",
				children: "Filters"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: stacked ? "grid grid-cols-2 gap-2" : "flex w-full max-w-full gap-2 overflow-x-auto pb-1",
				children: FILTERS.map((item) => {
					const selected = item.id === filter;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": selected,
						onClick: () => onFilter(item.id),
						className: "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-left text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.96] " + (selected ? "bg-cream text-ink" : "bg-panel text-cream"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { id: item.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block leading-tight",
							children: item.label
						}), stacked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-medium " + (selected ? "text-booth" : "text-muted"),
							children: item.blurb
						})] })]
					}, item.id);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: countdownId,
				className: "mb-2 text-sm font-semibold text-muted",
				children: "Countdown"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "radiogroup",
				"aria-labelledby": countdownId,
				className: "flex rounded-full bg-panel p-1",
				children: [
					[0, "Off"],
					[3, "3s"],
					[5, "5s"]
				].map(([len, label]) => {
					const selected = countdown === len;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "radio",
						"aria-checked": selected,
						onClick: () => onCountdown(len),
						className: "h-11 min-w-11 rounded-full px-3 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.96] " + (selected ? "bg-cream text-ink" : "text-cream"),
						children: label
					}, len);
				})
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": muted,
				"aria-label": muted ? "Unmute shutter sounds" : "Mute shutter sounds",
				onClick: () => onMuted(!muted),
				className: "grid h-11 w-11 place-items-center rounded-full bg-panel text-cream transition-transform duration-150 ease-out active:scale-[0.96]",
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
					className: "size-5",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
					className: "size-5",
					"aria-hidden": true
				})
			})]
		})]
	});
}
function Swatch({ id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: "h-4 w-4 shrink-0 rounded-full " + (id === "clean" ? "bg-cream" : id === "film" ? "bg-gold" : id === "flash" ? "bg-muted" : id === "noir" ? "bg-ink" : id === "pop" ? "bg-shutter" : "bg-panel ring-1 ring-cream")
	});
}
function IconButton({ label, disabled, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: "grid h-14 w-14 place-items-center rounded-full bg-panel text-cream transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
		children
	});
}
function StatePanel({ status }) {
	const copy = STATE_COPY[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-16 w-16 place-items-center rounded-full bg-booth text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(status === "requesting" ? LoaderCircle : status === "denied" ? ShieldOff : status === "missing" ? CameraOff : status === "busy" ? CameraOff : status === "unsupported" ? TriangleAlert : Camera, {
					className: "size-8 " + (status === "requesting" ? "animate-spin" : ""),
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl leading-tight",
				children: copy.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-sm leading-relaxed text-muted",
				children: copy.body
			})
		]
	});
}
function statusFromError(error) {
	const name = error instanceof DOMException ? error.name : "";
	if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
	if (name === "NotFoundError" || name === "DevicesNotFoundError") return "missing";
	if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") return "busy";
	if (name === "SecurityError" || name === "NotSupportedError") return "unsupported";
	return "denied";
}
function downloadShot(shot) {
	const link = document.createElement("a");
	link.href = shot.src;
	link.download = `popbooth-${fileStamp(shot.createdAt)}.jpg`;
	document.body.appendChild(link);
	link.click();
	link.remove();
}
function fileStamp(ms) {
	const date = new Date(ms);
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
function formatWhen(ms) {
	return new Date(ms).toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function wait(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});
}
var audioCtx = null;
function beep(freq, dur, muted) {
	if (muted) return;
	try {
		audioCtx ??= new AudioContext();
		if (audioCtx.state === "suspended") audioCtx.resume();
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = "square";
		osc.frequency.value = freq;
		osc.connect(gain);
		gain.connect(audioCtx.destination);
		const now = audioCtx.currentTime;
		gain.gain.setValueAtTime(.04, now);
		gain.gain.exponentialRampToValueAtTime(1e-4, now + dur);
		osc.start(now);
		osc.stop(now + dur);
	} catch {}
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoBooth, {});
}
//#endregion
export { Home as component };
