import { isFilterId, type FilterId, type Shot } from "@/lib/booth/filters";

const SHOTS_KEY = "popbooth.shots.v1";
const PREFS_KEY = "popbooth.prefs.v1";

export type CountdownLen = 0 | 3 | 5;

export type BoothPrefs = {
  filter: FilterId;
  countdown: CountdownLen;
  muted: boolean;
};

const DEFAULT_PREFS: BoothPrefs = {
  filter: "clean",
  countdown: 3,
  muted: false,
};

export function loadShots(): Shot[] {
  try {
    const raw = localStorage.getItem(SHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isShot).slice(0, 8);
  } catch {
    return [];
  }
}

export function saveShots(shots: Shot[]) {
  const trimmed = shots.slice(0, 8);
  try {
    localStorage.setItem(SHOTS_KEY, JSON.stringify(trimmed));
  } catch {
    try {
      localStorage.setItem(SHOTS_KEY, JSON.stringify(trimmed.slice(0, 3)));
    } catch {
      /* session memory still holds the strip */
    }
  }
}

export function loadPrefs(): BoothPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<BoothPrefs>;
    return {
      filter: isFilterId(parsed.filter) ? parsed.filter : DEFAULT_PREFS.filter,
      countdown: parsed.countdown === 0 || parsed.countdown === 3 || parsed.countdown === 5
        ? parsed.countdown
        : DEFAULT_PREFS.countdown,
      muted: Boolean(parsed.muted),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: BoothPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

function isShot(value: unknown): value is Shot {
  if (!value || typeof value !== "object") return false;
  const shot = value as Partial<Shot>;
  return (
    typeof shot.id === "string" &&
    typeof shot.src === "string" &&
    shot.src.startsWith("data:image/") &&
    isFilterId(shot.filter) &&
    typeof shot.createdAt === "number"
  );
}
