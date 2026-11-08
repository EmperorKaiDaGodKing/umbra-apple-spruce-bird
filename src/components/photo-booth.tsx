import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Aperture,
  Camera,
  CameraOff,
  Download,
  LoaderCircle,
  ShieldOff,
  SwitchCamera,
  Trash2,
  TriangleAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { paintLive, snapshotDataUrl } from "@/lib/booth/capture2d";
import {
  CSS_FILTER,
  FILTERS,
  filterLabel,
  type CamStatus,
  type Facing,
  type FilterId,
  type Shot,
} from "@/lib/booth/filters";
import { BoothRenderer } from "@/lib/booth/gl";
import {
  loadPrefs,
  loadShots,
  savePrefs,
  saveShots,
  type CountdownLen,
} from "@/lib/booth/storage";

const STATE_COPY: Record<Exclude<CamStatus, "live">, { title: string; body: string }> = {
  idle: {
    title: "Ready when you are",
    body: "The shutter asks for your camera. Photos stay on this device.",
  },
  requesting: {
    title: "Asking for the camera",
    body: "Allow access when the browser asks. You can stop it anytime.",
  },
  denied: {
    title: "Camera is blocked",
    body: "Set Camera to Allow for this site in the address bar, then hit the shutter again.",
  },
  missing: {
    title: "No camera found",
    body: "Plug one in, or open Popbooth on a phone or laptop that has a camera.",
  },
  busy: {
    title: "Camera is busy",
    body: "Another tab or app is using it. Close that, then try again.",
  },
  unsupported: {
    title: "Camera isn't available",
    body: "This browser can't open a camera here. Try Chrome, Safari, or Firefox.",
  },
};

const PILL: Record<CamStatus, string> = {
  idle: "Ready",
  requesting: "Asking",
  live: "Live",
  denied: "Blocked",
  missing: "No camera",
  busy: "In use",
  unsupported: "Unavailable",
};

export function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<BoothRenderer | null>(null);
  const runRef = useRef(0);
  const busyRef = useRef(false);
  const shutterRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<CamStatus>("idle");
  const [facing, setFacing] = useState<Facing>("user");
  const [canFlip, setCanFlip] = useState(false);
  const [filter, setFilter] = useState<FilterId>("clean");
  const [countdown, setCountdown] = useState<CountdownLen>(3);
  const [muted, setMuted] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [holdSrc, setHoldSrc] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [glOk, setGlOk] = useState(false);

  const statusRef = useRef(status);
  const facingRef = useRef(facing);
  const filterRef = useRef(filter);
  const countdownRef = useRef(countdown);
  const mutedRef = useRef(muted);
  const countRef = useRef(count);
  statusRef.current = status;
  facingRef.current = facing;
  filterRef.current = filter;
  countdownRef.current = countdown;
  mutedRef.current = muted;
  countRef.current = count;

  useEffect(() => {
    const prefs = loadPrefs();
    setFilter(prefs.filter);
    setCountdown(prefs.countdown);
    setMuted(prefs.muted);
    setShots(loadShots());
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    let raf = 0;
    let lastAnime = 0;
    const loop = (time: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        statusRef.current === "live" &&
        video &&
        canvas &&
        video.readyState >= 2 &&
        video.videoWidth > 1
      ) {
        const mirror = facingRef.current === "user";
        const current = filterRef.current;
        const renderer = rendererRef.current;
        if (renderer?.ok) {
          renderer.drawDisplay(video, current, mirror);
        } else if (current === "anime" && time - lastAnime > 90) {
          lastAnime = time;
          paintLive(canvas, video, current, mirror);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let gone = false;
    void (async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
        if (!gone) setStatus("unsupported");
        return;
      }
      try {
        const perm = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        if (!gone && perm.state === "denied") setStatus("denied");
      } catch {
        /* Some browsers have no camera permission query. */
      }
    })();
    return () => {
      gone = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    return () => {
      runRef.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      shutterRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function rememberPrefs(next: { filter?: FilterId; countdown?: CountdownLen; muted?: boolean }) {
    const prefs = {
      filter: next.filter ?? filter,
      countdown: next.countdown ?? countdown,
      muted: next.muted ?? muted,
    };
    if (next.filter) setFilter(next.filter);
    if (next.countdown !== undefined) setCountdown(next.countdown);
    if (next.muted !== undefined) setMuted(next.muted);
    savePrefs(prefs);
  }

  async function openCamera(nextFacing: Facing, flip: boolean) {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    setNotice(null);
    const previous = streamRef.current;
    try {
      let video: MediaTrackConstraints = {
        facingMode: { ideal: nextFacing },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };
      if (flip) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter((device) => device.kind === "videoinput");
        const currentId = previous?.getVideoTracks()[0]?.getSettings().deviceId;
        const other = videos.find((device) => device.deviceId && device.deviceId !== currentId);
        if (other) {
          video = {
            deviceId: { exact: other.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
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
      const facingNow: Facing =
        reported === "environment" || reported === "user" ? reported : nextFacing;
      facingRef.current = facingNow;
      setFacing(facingNow);
      setStatus("live");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((device) => device.kind === "videoinput");
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
    beep(180, 0.12, mutedRef.current);
    try {
      const frame = frameRef.current;
      const aspect =
        frame && frame.clientHeight > 0 ? frame.clientWidth / frame.clientHeight : 3 / 4;
      const mirror = facingRef.current === "user";
      const current = filterRef.current;
      const renderer = rendererRef.current;
      const src =
        renderer && renderer.ok
          ? renderer.snapshot(video, current, mirror, aspect)
          : snapshotDataUrl(video, current, mirror, aspect);
      const shot: Shot = {
        id: crypto.randomUUID(),
        src,
        filter: current,
        createdAt: Date.now(),
      };
      setShots((prev) => {
        const next = [shot, ...prev].slice(0, 8);
        saveShots(next);
        return next;
      });
      setHoldSrc(src);
      window.setTimeout(() => {
        setHoldSrc((currentSrc) => (currentSrc === src ? null : currentSrc));
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
    const len = countdownRef.current as number;
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
        beep(n === 1 ? 880 : 620, 0.08, mutedRef.current);
        await wait(1000);
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
    void onShutter();
  };

  function removeShot(id: string) {
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

  const shutterLabel =
    status !== "live"
      ? "Open camera"
      : count !== null
        ? "Cancel countdown"
        : "Take photo";

  const shutterHint =
    status === "requesting"
      ? "Waiting for permission…"
      : status !== "live"
        ? "Tap the shutter to open the camera"
        : count !== null
          ? "Tap the shutter to cancel"
          : countdown === 0
            ? "Tap the shutter. No countdown."
            : `Tap the shutter. ${countdown} second countdown.`;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden px-4 py-3">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl leading-none tracking-wide">Popbooth</h1>
          <p className="mt-1 text-sm text-muted">A sticker booth for your webcam</p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full bg-booth px-3 py-2 text-sm font-semibold">
          <span
            className={
              "h-2.5 w-2.5 rounded-full " +
              (status === "live"
                ? "live-dot bg-gold"
                : status === "idle" || status === "requesting"
                  ? "bg-muted"
                  : "bg-shutter")
            }
            aria-hidden
          />
          {PILL[status]}
        </p>
      </header>
      <p className="sr-only" aria-live="polite">
        {status === "live" ? "Camera is live" : STATE_COPY[status].title}
      </p>
      <p className="sr-only" aria-live="assertive">
        {count !== null ? `Countdown ${count}` : ""}
      </p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div ref={frameRef} className="booth-frame relative min-h-0 flex-1 rounded-3xl p-3">
            <div className="relative h-full overflow-hidden rounded-2xl bg-ink">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={
                  "absolute inset-0 h-full w-full object-cover " +
                  (showCssVideo ? "" : "invisible ") +
                  (showCssVideo && facing === "user" ? "mirror-x" : "")
                }
                style={showCssVideo ? { filter: CSS_FILTER[filter] } : undefined}
              />
              {status === "live" && (
                <canvas
                  ref={canvasRef}
                  className={
                    "absolute inset-0 h-full w-full " +
                    (glOk || filter === "anime" ? "" : "invisible")
                  }
                />
              )}
              {status !== "live" && <StatePanel status={status} />}
              {status === "live" && count !== null && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span key={count} className="count-num text-8xl leading-none">
                    {count}
                  </span>
                </div>
              )}
              {status === "live" && !holdSrc && count === null && (
                <>
                  <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-sm font-semibold">
                    {filterLabel(filter)}
                  </p>
                  <p className="pointer-events-none absolute inset-x-3 bottom-3 text-center text-sm">
                    <span className="rounded-full bg-ink/75 px-3 py-1">
                      {facing === "user"
                        ? "Front camera · mirrored"
                        : "Rear camera · not mirrored"}
                    </span>
                  </p>
                </>
              )}
              {holdSrc && (
                <img
                  src={holdSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {flashKey > 0 && (
                <div key={flashKey} className="flash-overlay absolute inset-0" aria-hidden />
              )}
              {notice && (
                <p
                  role="status"
                  className="absolute bottom-14 left-1/2 z-20 max-w-xs -translate-x-1/2 rounded-full bg-gold px-3 py-2 text-center text-sm font-semibold text-ink"
                >
                  {notice}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0 lg:hidden">
            <Controls
              filter={filter}
              countdown={countdown}
              muted={muted}
              idPrefix="hand"
              onFilter={(id) => rememberPrefs({ filter: id })}
              onCountdown={(len) => rememberPrefs({ countdown: len })}
              onMuted={(next) => rememberPrefs({ muted: next })}
            />
          </div>

          <div className="shrink-0">
            <div className="flex items-center justify-center gap-5">
              <IconButton
                label={canFlip ? "Flip camera" : "Flip camera unavailable"}
                disabled={!canFlip || status !== "live" || count !== null}
                onClick={() => {
                  void openCamera(facing === "user" ? "environment" : "user", true);
                }}
              >
                <SwitchCamera className="size-6" aria-hidden />
              </IconButton>
              <button
                type="button"
                aria-label={shutterLabel}
                disabled={status === "requesting"}
                onClick={() => {
                  void onShutter();
                }}
                className="grid h-20 w-20 place-items-center rounded-full bg-gold p-1.5 transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40"
              >
                <span className="grid h-full w-full place-items-center rounded-full bg-shutter text-ink">
                  {status === "requesting" ? (
                    <LoaderCircle className="size-8 animate-spin" aria-hidden />
                  ) : (
                    <Aperture className="size-8" aria-hidden />
                  )}
                </span>
              </button>
              <IconButton
                label="Download latest shot"
                disabled={!latest}
                onClick={() => {
                  if (latest) downloadShot(latest);
                }}
              >
                <Download className="size-6" aria-hidden />
              </IconButton>
            </div>
            <p className="mt-2 text-center text-sm text-muted">{shutterHint}</p>
          </div>

          <section
            className="strip-rail min-w-0 shrink-0 rounded-2xl px-5 py-3 text-ink"
            aria-label="Recent shots"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg leading-none">Strip</h2>
              <p className="text-sm text-booth">
                {shots.length === 0 ? "Empty" : `${shots.length} on this device`}
              </p>
            </div>
            {shots.length === 0 ? (
              <p className="py-2 text-sm text-booth">
                Shots land here after the flash. Nothing is uploaded.
              </p>
            ) : (
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {shots.map((shot) => (
                  <li key={shot.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveId(shot.id)}
                      className={
                        "w-16 overflow-hidden rounded-lg transition-transform duration-150 ease-out active:scale-[0.96] " +
                        (shot.id === latest?.id ? "ring-2 ring-gold" : "ring-2 ring-transparent")
                      }
                      aria-label={`Open ${filterLabel(shot.filter)} shot`}
                    >
                      <img
                        src={shot.src}
                        alt=""
                        className="aspect-3/4 w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hidden w-72 shrink-0 flex-col lg:flex">
          <div className="flex flex-1 flex-col rounded-3xl bg-booth p-4">
            <Controls
              filter={filter}
              countdown={countdown}
              muted={muted}
              stacked
              idPrefix="desk"
              onFilter={(id) => rememberPrefs({ filter: id })}
              onCountdown={(len) => rememberPrefs({ countdown: len })}
              onMuted={(next) => rememberPrefs({ muted: next })}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Pick a look, count it down, then hit the shutter. Anime draws flat cel color and ink
              lines while you pose. The download matches the preview.
            </p>
          </div>
        </aside>
      </div>

      <Dialog.Root
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/80" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4 focus:outline-none">
            {active && (
              <div className="rounded-3xl bg-cream p-3 text-ink">
                <div className="flex items-start justify-between gap-3 px-1">
                  <div>
                    <Dialog.Title className="font-display text-2xl leading-none">
                      {filterLabel(active.filter)}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-booth">
                      {formatWhen(active.createdAt)}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close
                    type="button"
                    aria-label="Close"
                    className="grid h-11 w-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    <X className="size-5" aria-hidden />
                  </Dialog.Close>
                </div>
                <img src={active.src} alt="" className="mt-3 w-full rounded-2xl" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => downloadShot(active)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-shutter font-semibold text-ink transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    <Download className="size-4" aria-hidden />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => removeShot(active.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink font-semibold text-cream transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

function Controls({
  filter,
  countdown,
  muted,
  stacked = false,
  idPrefix,
  onFilter,
  onCountdown,
  onMuted,
}: {
  filter: FilterId;
  countdown: CountdownLen;
  muted: boolean;
  stacked?: boolean;
  idPrefix: string;
  onFilter: (id: FilterId) => void;
  onCountdown: (len: CountdownLen) => void;
  onMuted: (muted: boolean) => void;
}) {
  const countdownId = `${idPrefix}-countdown`;
  return (
    <div className="flex flex-col gap-3">
      <div className="min-w-0">
        <p className="mb-2 text-sm font-semibold text-muted">Filters</p>
        <div
          className={
            stacked
              ? "grid grid-cols-2 gap-2"
              : "flex w-full max-w-full gap-2 overflow-x-auto pb-1"
          }
        >
          {FILTERS.map((item) => {
            const selected = item.id === filter;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onFilter(item.id)}
                className={
                  "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-left text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.96] " +
                  (selected ? "bg-cream text-ink" : "bg-panel text-cream")
                }
              >
                <Swatch id={item.id} />
                <span>
                  <span className="block leading-tight">{item.label}</span>
                  {stacked && (
                    <span
                      className={
                        "block text-xs font-medium " + (selected ? "text-booth" : "text-muted")
                      }
                    >
                      {item.blurb}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p id={countdownId} className="mb-2 text-sm font-semibold text-muted">
            Countdown
          </p>
          <div role="radiogroup" aria-labelledby={countdownId} className="flex rounded-full bg-panel p-1">
            {(
              [
                [0, "Off"],
                [3, "3s"],
                [5, "5s"],
              ] as const
            ).map(([len, label]) => {
              const selected = countdown === len;
              return (
                <button
                  key={len}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onCountdown(len)}
                  className={
                    "h-11 min-w-11 rounded-full px-3 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.96] " +
                    (selected ? "bg-cream text-ink" : "text-cream")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={muted}
          aria-label={muted ? "Unmute shutter sounds" : "Mute shutter sounds"}
          onClick={() => onMuted(!muted)}
          className="grid h-11 w-11 place-items-center rounded-full bg-panel text-cream transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          {muted ? (
            <VolumeX className="size-5" aria-hidden />
          ) : (
            <Volume2 className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function Swatch({ id }: { id: FilterId }) {
  const tone =
    id === "clean"
      ? "bg-cream"
      : id === "film"
        ? "bg-gold"
        : id === "flash"
          ? "bg-muted"
          : id === "noir"
            ? "bg-ink"
            : id === "pop"
              ? "bg-shutter"
              : "bg-panel ring-1 ring-cream";
  return <span aria-hidden className={"h-4 w-4 shrink-0 rounded-full " + tone} />;
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-14 w-14 place-items-center rounded-full bg-panel text-cream transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function StatePanel({ status }: { status: Exclude<CamStatus, "live"> }) {
  const copy = STATE_COPY[status];
  const Icon =
    status === "requesting"
      ? LoaderCircle
      : status === "denied"
        ? ShieldOff
        : status === "missing"
          ? CameraOff
          : status === "busy"
            ? CameraOff
            : status === "unsupported"
              ? TriangleAlert
              : Camera;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-booth text-gold">
        <Icon className={"size-8 " + (status === "requesting" ? "animate-spin" : "")} aria-hidden />
      </span>
      <h2 className="font-display text-2xl leading-tight">{copy.title}</h2>
      <p className="max-w-xs text-sm leading-relaxed text-muted">{copy.body}</p>
    </div>
  );
}

function statusFromError(error: unknown): CamStatus {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "missing";
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
    return "busy";
  }
  if (name === "SecurityError" || name === "NotSupportedError") return "unsupported";
  return "denied";
}

function downloadShot(shot: Shot) {
  const link = document.createElement("a");
  link.href = shot.src;
  link.download = `popbooth-${fileStamp(shot.createdAt)}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function fileStamp(ms: number) {
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function formatWhen(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

let audioCtx: AudioContext | null = null;

function beep(freq: number, dur: number, muted: boolean) {
  if (muted) return;
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  } catch {
    /* Sound is optional. */
  }
}
