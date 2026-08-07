import { z } from "zod";

// =============================================================================
// SCHEMA
// Zod schemas defining the shape of accessibility preferences.
// This is the source of truth for what preferences exist and their valid values.
// =============================================================================

/**
 * Valid color mode values.
 * - `"light"` — always light mode
 * - `"dark"` — always dark mode
 * - `"system"` — follows the OS preference via prefers-color-scheme
 */
export const ColorModeSchema = z.enum(["light", "dark", "system"]);
export type ColorMode = z.infer<typeof ColorModeSchema>;

/**
 * Valid text size values.
 * Applied as a CSS custom property on the content wrapper.
 * - `"base"` — 1rem (default)
 * - `"lg"` — 1.125rem
 * - `"xl"` — 1.25rem
 * - `"xxl"` — 1.5rem
 */
export const TextSizeSchema = z.enum(["base", "lg", "xl", "xxl"]);
export type TextSize = z.infer<typeof TextSizeSchema>;

/**
 * The full accessibility preferences object.
 * All fields have defaults so a partial object from localStorage
 * can be safely merged with the defaults.
 */
export const AccessibilityPreferencesSchema = z.object({
  /**
   * Color mode preference.
   * Controls the `data-mode` attribute on the root element.
   * @default "system"
   */
  colorMode: ColorModeSchema.default("system"),

  /**
   * Text size preference.
   * Controls the `--a11y-text-size` CSS custom property
   * on the content wrapper element.
   * @default "base"
   */
  textSize: TextSizeSchema.default("base"),

  /**
   * Whether reduced motion is enabled.
   * Adds `data-reduce-motion="true"` to the root element.
   * Consumers should use this to disable animations in their app.
   * @default false
   */
  reduceMotion: z.boolean().default(false),

  /**
   * Whether high contrast mode is enabled.
   * Adds `data-high-contrast="true"` to the root element.
   * Consumers must provide high contrast CSS variable overrides.
   * @default false
   */
  highContrast: z.boolean().default(false),

  /**
   * Whether enhanced focus indicators are enabled.
   * Adds `data-focus-visible="true"` to the root element.
   * Consumers must provide enhanced focus ring CSS.
   * @default false
   */
  focusIndicators: z.boolean().default(false),
});

export type AccessibilityPreferences = z.infer<
  typeof AccessibilityPreferencesSchema
>;

/**
 * The default preferences object.
 * Used when no saved preferences exist.
 */
export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  colorMode: "system",
  textSize: "base",
  reduceMotion: false,
  highContrast: false,
  focusIndicators: false,
};

// =============================================================================
// TEXT SIZE HELPERS
// Pure functions for mapping text size values to CSS values.
// =============================================================================

/**
 * Maps a TextSize value to its corresponding CSS font-size value.
 *
 * Pure function — no side effects.
 *
 * @param size - The text size preference value.
 * @returns The CSS font-size value as a string.
 *
 * @example
 * ```ts
 * resolveTextSizeCss("base") // → "1rem"
 * resolveTextSizeCss("lg")   // → "1.125rem"
 * resolveTextSizeCss("xl")   // → "1.25rem"
 * resolveTextSizeCss("xxl")  // → "1.5rem"
 * ```
 */
export function resolveTextSizeCss(size: TextSize): string {
  const map: Record<TextSize, string> = {
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xxl: "1.5rem",
  };
  return map[size];
}

/**
 * Maps a TextSize value to its human-readable label.
 *
 * Pure function — no side effects.
 *
 * @param size - The text size preference value.
 * @returns A human-readable label for the text size.
 *
 * @example
 * ```ts
 * resolveTextSizeLabel("base") // → "Default"
 * resolveTextSizeLabel("lg")   // → "Large"
 * resolveTextSizeLabel("xl")   // → "Extra large"
 * resolveTextSizeLabel("xxl")  // → "Maximum"
 * ```
 */
export function resolveTextSizeLabel(size: TextSize): string {
  const map: Record<TextSize, string> = {
    base: "Default",
    lg: "Large",
    xl: "Extra large",
    xxl: "Maximum",
  };
  return map[size];
}

/**
 * Maps a ColorMode value to its human-readable label.
 *
 * Pure function — no side effects.
 *
 * @param mode - The color mode preference value.
 * @returns A human-readable label for the color mode.
 *
 * @example
 * ```ts
 * resolveColorModeLabel("system") // → "System default"
 * resolveColorModeLabel("light")  // → "Light"
 * resolveColorModeLabel("dark")   // → "Dark"
 * ```
 */
export function resolveColorModeLabel(mode: ColorMode): string {
  const map: Record<ColorMode, string> = {
    system: "System default",
    light: "Light",
    dark: "Dark",
  };
  return map[mode];
}

// =============================================================================
// PREFERENCE HELPERS
// Pure functions for merging and validating preferences.
// =============================================================================

/**
 * Safely merges a partial preferences object with the defaults.
 * Invalid values from localStorage are replaced with defaults via Zod parsing.
 *
 * Pure function — no side effects.
 *
 * @param raw - A raw unknown value from localStorage or another source.
 * @returns A valid, fully-populated AccessibilityPreferences object.
 *
 * @example
 * ```ts
 * mergeWithDefaults({ colorMode: "dark" })
 * // → { colorMode: "dark", textSize: "base", reduceMotion: false, ... }
 *
 * mergeWithDefaults({ colorMode: "invalid" })
 * // → { colorMode: "system", textSize: "base", ... } (invalid value replaced)
 *
 * mergeWithDefaults(null)
 * // → DEFAULT_PREFERENCES
 * ```
 */
export function mergeWithDefaults(raw: unknown): AccessibilityPreferences {
  const result = AccessibilityPreferencesSchema.safeParse(raw);
  if (result.success) return result.data;
  return DEFAULT_PREFERENCES;
}

/**
 * Returns a new preferences object with one field updated.
 * Does not mutate the input.
 *
 * Pure function — no side effects.
 *
 * @param current - The current preferences object.
 * @param key - The preference key to update.
 * @param value - The new value for the key.
 * @returns A new preferences object with the updated value.
 *
 * @example
 * ```ts
 * updatePreference(current, "colorMode", "dark")
 * // → { ...current, colorMode: "dark" }
 * ```
 */
export function updatePreference<K extends keyof AccessibilityPreferences>(
  current: AccessibilityPreferences,
  key: K,
  value: AccessibilityPreferences[K],
): AccessibilityPreferences {
  return { ...current, [key]: value };
}
