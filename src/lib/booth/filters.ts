export type FilterId = "clean" | "film" | "flash" | "noir" | "pop" | "anime";

export type Shot = {
  id: string;
  src: string;
  filter: FilterId;
  createdAt: number;
};

export type Facing = "user" | "environment";

export type CamStatus =
  | "idle"
  | "requesting"
  | "live"
  | "denied"
  | "missing"
  | "busy"
  | "unsupported";

export const FILTERS: { id: FilterId; label: string; blurb: string }[] = [
  { id: "clean", label: "Clean", blurb: "No grade" },
  { id: "film", label: "Warm Film", blurb: "Gold and grain" },
  { id: "flash", label: "Cool Flash", blurb: "Bright and airy" },
  { id: "noir", label: "Noir", blurb: "Hard black and white" },
  { id: "pop", label: "Pop", blurb: "Sticker color" },
  { id: "anime", label: "Anime", blurb: "Cel color, ink lines" },
];

export const FILTER_INDEX: Record<FilterId, number> = {
  clean: 0,
  film: 1,
  flash: 2,
  noir: 3,
  pop: 4,
  anime: 5,
};

export function filterLabel(id: FilterId): string {
  return FILTERS.find((filter) => filter.id === id)?.label ?? "Clean";
}

export const CSS_FILTER: Record<FilterId, string> = {
  clean: "none",
  film: "sepia(0.45) contrast(1.08) saturate(1.15)",
  flash: "brightness(1.16) contrast(1.04) saturate(0.72)",
  noir: "grayscale(1) contrast(1.28) brightness(1.04)",
  pop: "saturate(1.65) contrast(1.16)",
  anime: "saturate(1.4) contrast(1.45)",
};

export function isFilterId(value: unknown): value is FilterId {
  return typeof value === "string" && value in FILTER_INDEX;
}
