import { create } from "zustand"

export type ThemeMode = "horde" | "alliance"

type ThemeState = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const KEY = "flowcraft.theme"

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.setAttribute("data-theme", mode)
  localStorage.setItem(KEY, mode)
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: (typeof window !== "undefined" && (localStorage.getItem(KEY) as ThemeMode)) || "horde",
  setMode: (m) => { applyTheme(m); set({ mode: m }) },
  toggle: () => {
    const next = get().mode === "horde" ? "alliance" : "horde"
    applyTheme(next); set({ mode: next })
  },
}))

// zainicjuj atrybut przy pierwszym załadowaniu modułu
if (typeof window !== "undefined") {
  const initial = (localStorage.getItem(KEY) as ThemeMode) || "horde"
  document.documentElement.setAttribute("data-theme", initial)
}


