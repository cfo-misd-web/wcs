import type { AccessibilityPreferences } from "@/lib/accessibility/validation";
import { mergeWithDefaults } from "@/lib/accessibility/validation";

// =============================================================================
// ADAPTER INTERFACE
// Defines the contract for reading and writing accessibility preferences.
// The component never touches storage directly — it calls these functions.
// Consumers inject the adapter, making storage completely swappable.
// =============================================================================

/**
 * Adapter interface for reading and writing accessibility preferences.
 *
 * Inject this into the `AccessibilityPanel` to control where preferences
 * are stored. The component has no knowledge of the underlying storage
 * mechanism — it only calls `load` and `save`.
 *
 * Built-in adapters are provided for localStorage. For server-side
 * persistence (e.g. via oRPC or Hono), implement this interface and
 * inject your own adapter.
 *
 * @example Custom oRPC adapter
 * ```ts
 * const orpcAdapter: AccessibilityStorageAdapter = {
 *   load: async () => {
 *     const prefs = await orpc.user.getPreferences()
 *     return mergeWithDefaults(prefs)
 *   },
 *   save: async (prefs) => {
 *     await orpc.user.savePreferences(prefs)
 *   },
 * }
 * ```
 *
 * @example Custom Hono adapter
 * ```ts
 * const honoAdapter: AccessibilityStorageAdapter = {
 *   load: async () => {
 *     const res = await fetch("/api/preferences")
 *     const data = await res.json()
 *     return mergeWithDefaults(data)
 *   },
 *   save: async (prefs) => {
 *     await fetch("/api/preferences", {
 *       method: "PUT",
 *       body: JSON.stringify(prefs),
 *     })
 *   },
 * }
 * ```
 */
export interface AccessibilityStorageAdapter {
  /**
   * Loads the current accessibility preferences from storage.
   * Must always return a valid, fully-populated preferences object.
   * Use `mergeWithDefaults` to safely handle missing or invalid values.
   *
   * @returns A promise resolving to the current preferences.
   */
  load: () => Promise<AccessibilityPreferences>;

  /**
   * Saves the current accessibility preferences to storage.
   *
   * @param prefs - The preferences object to save.
   * @returns A promise that resolves when the save is complete.
   */
  save: (prefs: AccessibilityPreferences) => Promise<void>;
}

// =============================================================================
// LOCALSTORAGE ADAPTER
// The default adapter for persisting preferences in the browser.
// No server required. Falls back to defaults if storage is unavailable
// or if stored data is invalid.
// =============================================================================

/**
 * The localStorage key used to store accessibility preferences.
 * Scoped to avoid collisions with other localStorage entries.
 */
const STORAGE_KEY = "a11y-preferences";

/**
 * Creates a localStorage-based accessibility storage adapter.
 *
 * Preferences are stored as JSON under the key `"a11y-preferences"`.
 * Invalid or missing data is safely replaced with defaults via
 * `mergeWithDefaults`.
 *
 * This is the recommended adapter for most use cases — no server
 * or authentication required. Preferences persist across page loads
 * but are scoped to the browser and device.
 *
 * @returns An `AccessibilityStorageAdapter` backed by localStorage.
 *
 * @example Basic usage
 * ```tsx
 * import { createLocalStorageAdapter } from "@/integration/accessibility/adapter"
 *
 * const adapter = createLocalStorageAdapter()
 *
 * <AccessibilityPanel adapter={adapter} features={buildDefaultFeatures()} />
 * ```
 *
 * @example With a custom storage key
 * ```tsx
 * const adapter = createLocalStorageAdapter("my-app-a11y")
 * ```
 */
export function createLocalStorageAdapter(
  storageKey: string = STORAGE_KEY,
): AccessibilityStorageAdapter {
  return {
    /**
     * Loads preferences from localStorage.
     * Returns defaults if the key is missing, storage is unavailable,
     * or the stored value fails Zod validation.
     */
    load: async (): Promise<AccessibilityPreferences> => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return mergeWithDefaults(null);
        return mergeWithDefaults(JSON.parse(raw));
      } catch {
        return mergeWithDefaults(null);
      }
    },

    /**
     * Saves preferences to localStorage as a JSON string.
     * Silently handles storage errors (e.g. private browsing quota limits).
     */
    save: async (prefs: AccessibilityPreferences): Promise<void> => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(prefs));
      } catch {
        // localStorage may be unavailable in private browsing
        // or when the storage quota is exceeded. Fail silently —
        // preferences will still apply for the current session.
      }
    },
  };
}

// =============================================================================
// SYSTEM PREFERENCE HELPERS
// Pure functions for reading OS-level accessibility preferences.
// Used to initialize state when colorMode is "system".
// =============================================================================

/**
 * Reads the current OS color scheme preference via the
 * `prefers-color-scheme` media query.
 *
 * Pure function — reads from the environment but does not mutate it.
 *
 * @returns `"dark"` if the OS prefers dark mode, `"light"` otherwise.
 *
 * @example
 * ```ts
 * const osMode = getSystemColorScheme()
 * // → "dark" | "light"
 * ```
 */
export function getSystemColorScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Reads the OS reduced motion preference via the
 * `prefers-reduced-motion` media query.
 *
 * Pure function — reads from the environment but does not mutate it.
 *
 * @returns `true` if the OS prefers reduced motion, `false` otherwise.
 *
 * @example
 * ```ts
 * const prefersReduced = getSystemReduceMotion()
 * // → true | false
 * ```
 */
export function getSystemReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Resolves the effective color mode to apply to the DOM.
 * When the preference is `"system"`, reads the OS preference.
 * Otherwise returns the stored preference directly.
 *
 * Pure function — no side effects.
 *
 * @param colorMode - The stored color mode preference.
 * @returns The effective color mode to apply — always `"light"` or `"dark"`.
 *
 * @example
 * ```ts
 * resolveEffectiveColorMode("system") // → "dark" (if OS is dark)
 * resolveEffectiveColorMode("light")  // → "light"
 * resolveEffectiveColorMode("dark")   // → "dark"
 * ```
 */
export function resolveEffectiveColorMode(
  colorMode: "light" | "dark" | "system",
): "light" | "dark" {
  if (colorMode === "system") return getSystemColorScheme();
  return colorMode;
}
