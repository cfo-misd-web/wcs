import type {
  AccessibilityPreferences,
  ColorMode,
  TextSize,
} from "./validation";
import { resolveTextSizeCss } from "./validation";

// =============================================================================
// FEATURE INTERFACE
// Defines the contract for both built-in and consumer-injected features.
// Each feature knows how to apply itself to the DOM and how to reset.
// The component never touches the DOM directly — it calls these functions.
// =============================================================================

/**
 * The type of control rendered for a feature in the panel.
 * - `"toggle"` — a simple on/off switch
 * - `"select"` — a dropdown with predefined options
 * - `"range"` — a slider with min/max values (reserved for future features)
 */
export type FeatureControlType = "toggle" | "select" | "range";

/**
 * A selectable option for `"select"` type features.
 */
export type FeatureOption = {
  /** The stored value. */
  value: string;
  /** The human-readable label shown in the UI. */
  label: string;
};

/**
 * A single accessibility feature — either built-in or consumer-injected.
 *
 * Each feature is self-contained: it knows its label, its control type,
 * how to read its current value from preferences, how to apply itself
 * to the DOM, and how to reset itself.
 *
 * The component never has special knowledge of any specific feature.
 * It just renders whatever features it receives.
 *
 * @example Custom feature — dyslexia font
 * ```ts
 * const dyslexiaFont: AccessibilityFeature = {
 *   id: "dyslexia-font",
 *   label: "Dyslexia-friendly font",
 *   description: "Uses OpenDyslexic font for easier reading.",
 *   control: { type: "toggle" },
 *   getValue: () => document.documentElement.classList.contains("font-dyslexia"),
 *   apply: (enabled) => {
 *     document.documentElement.classList.toggle("font-dyslexia", enabled as boolean)
 *   },
 *   reset: () => {
 *     document.documentElement.classList.remove("font-dyslexia")
 *   },
 * }
 * ```
 *
 * @example Custom feature — screen reader hints
 * ```ts
 * const screenReaderHints: AccessibilityFeature = {
 *   id: "screen-reader-hints",
 *   label: "Screen reader hints",
 *   description: "Shows additional context labels for screen reader users.",
 *   control: { type: "toggle" },
 *   getValue: () => document.documentElement.hasAttribute("data-sr-hints"),
 *   apply: (enabled) => {
 *     document.documentElement.toggleAttribute("data-sr-hints", enabled as boolean)
 *   },
 *   reset: () => {
 *     document.documentElement.removeAttribute("data-sr-hints")
 *   },
 * }
 * ```
 */
export type AccessibilityFeature = {
  /**
   * Unique identifier for the feature.
   * Used as the key when storing and reading preferences.
   * Must be unique across all features including custom ones.
   */
  id: string;

  /**
   * Human-readable name shown in the panel.
   * @example "Dark mode" | "Larger text" | "Reduce motion"
   */
  label: string;

  /**
   * Optional description shown below the label in the panel.
   * @example "Reduces eye strain in low-light environments."
   */
  description?: string;

  /**
   * Controls what UI element renders for this feature.
   */
  control:
    | { type: "toggle" }
    | { type: "select"; options: FeatureOption[] }
    | { type: "range"; min: number; max: number; step: number };

  /**
   * Reads the current value of this feature from the preferences object.
   * Used to keep the panel UI in sync with stored preferences.
   *
   * @param prefs - The current accessibility preferences.
   * @returns The current value of this feature.
   */
  getValue: (prefs: AccessibilityPreferences) => unknown;

  /**
   * Applies the feature to the DOM.
   * Called whenever the user changes the value in the panel.
   * Should be idempotent — calling it multiple times with the same
   * value should produce the same result.
   *
   * @param value - The new value selected by the user.
   */
  apply: (value: unknown) => void;

  /**
   * Resets the feature to its default state in the DOM.
   * Called when preferences are cleared or reset to defaults.
   */
  reset: () => void;
};

// =============================================================================
// BUILT-IN FEATURE DEFINITIONS
// Each built-in feature is a pure factory function that returns an
// AccessibilityFeature. Factory functions keep the definitions
// tree-shakeable and testable in isolation.
// =============================================================================

/**
 * Built-in feature — color mode (light / dark / system).
 * Sets the `data-mode` attribute on the root element.
 * Kumo reads this attribute to apply its light/dark token values.
 *
 * @returns An AccessibilityFeature for color mode control.
 */
export function createColorModeFeature(): AccessibilityFeature {
  return {
    id: "colorMode",
    label: "Color mode",
    description: "Choose between light, dark, or your system's default.",
    control: {
      type: "select",
      options: [
        { value: "system", label: "System default" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
    },
    getValue: (prefs) => prefs.colorMode,
    apply: (value) => {
      const mode = value as ColorMode;
      if (mode === "system") {
        document.documentElement.removeAttribute("data-mode");
      } else {
        document.documentElement.setAttribute("data-mode", mode);
      }
    },
    reset: () => {
      document.documentElement.removeAttribute("data-mode");
    },
  };
}

/**
 * Built-in feature — text size.
 * Sets the `--a11y-text-size` CSS custom property on the content wrapper
 * element matched by `contentSelector`.
 *
 * **Required CSS setup** — add this to your global stylesheet:
 * ```css
 * .app-content { font-size: var(--a11y-text-size, 1rem); }
 * ```
 *
 * This CSS is intentionally not injected by the component — the consumer
 * owns global styles. If your content wrapper uses a different class name,
 * pass it via `contentSelector` and update the CSS accordingly.
 *
 * This follows the same pattern as Kumo itself — styles must be imported
 * manually so consumers retain full control over specificity and selector
 * naming.
 *
 * @param contentSelector - CSS selector for the content wrapper element.
 *   The `--a11y-text-size` variable is set directly on this element's
 *   inline style. Defaults to `".app-content"`.
 *
 * @returns An AccessibilityFeature for text size control.
 *
 * @example Default selector
 * ```ts
 * // In your stylesheet:
 * // .app-content { font-size: var(--a11y-text-size, 1rem); }
 *
 * createTextSizeFeature()
 * // or
 * createTextSizeFeature(".app-content")
 * ```
 *
 * @example Custom selector
 * ```ts
 * // In your stylesheet:
 * // .main-content { font-size: var(--a11y-text-size, 1rem); }
 *
 * createTextSizeFeature(".main-content")
 * ```
 */
export function createTextSizeFeature(
  contentSelector: string = ".app-content",
): AccessibilityFeature {
  return {
    id: "textSize",
    label: "Text size",
    description: "Increase text size for easier reading.",
    control: {
      type: "select",
      options: [
        { value: "base", label: "Default" },
        { value: "lg", label: "Large" },
        { value: "xl", label: "Extra large" },
        { value: "xxl", label: "Maximum" },
      ],
    },
    getValue: (prefs) => prefs.textSize,
    apply: (value) => {
      const size = value as TextSize;
      const css = resolveTextSizeCss(size);
      const el = document.querySelector(contentSelector) as HTMLElement | null;
      if (el) {
        el.style.setProperty("--a11y-text-size", css);
      }
    },
    reset: () => {
      const el = document.querySelector(contentSelector) as HTMLElement | null;
      if (el) {
        el.style.removeProperty("--a11y-text-size");
      }
    },
  };
}

/**
 * Built-in feature — reduce motion.
 * Sets the `data-reduce-motion` attribute on the root element.
 * Consumers should use this alongside the CSS media query:
 *
 * ```css
 * [data-reduce-motion="true"] * {
 *   animation-duration: 0.01ms !important;
 *   transition-duration: 0.01ms !important;
 * }
 * ```
 *
 * @returns An AccessibilityFeature for reduce motion control.
 */
export function createReduceMotionFeature(): AccessibilityFeature {
  return {
    id: "reduceMotion",
    label: "Reduce motion",
    description: "Minimizes animations for users sensitive to motion.",
    control: { type: "toggle" },
    getValue: (prefs) => prefs.reduceMotion,
    apply: (value) => {
      document.documentElement.setAttribute(
        "data-reduce-motion",
        String(value),
      );
    },
    reset: () => {
      document.documentElement.removeAttribute("data-reduce-motion");
    },
  };
}

/**
 * Built-in feature — high contrast.
 * Sets the `data-high-contrast` attribute on the root element.
 * Consumers must provide high contrast CSS variable overrides:
 *
 * ```css
 * [data-high-contrast="true"] {
 *   --kumo-text-default: #000000;
 *   --kumo-bg-base: #ffffff;
 *   --kumo-border-hairline: #000000;
 * }
 * ```
 *
 * @returns An AccessibilityFeature for high contrast control.
 */
export function createHighContrastFeature(): AccessibilityFeature {
  return {
    id: "highContrast",
    label: "High contrast",
    description: "Increases color contrast for better visibility.",
    control: { type: "toggle" },
    getValue: (prefs) => prefs.highContrast,
    apply: (value) => {
      document.documentElement.setAttribute(
        "data-high-contrast",
        String(value),
      );
    },
    reset: () => {
      document.documentElement.removeAttribute("data-high-contrast");
    },
  };
}

/**
 * Built-in feature — enhanced focus indicators.
 * Sets the `data-focus-visible` attribute on the root element.
 * Consumers must provide enhanced focus ring CSS:
 *
 * ```css
 * [data-focus-visible="true"] :focus-visible {
 *   outline: 3px solid #005fcc;
 *   outline-offset: 3px;
 * }
 * ```
 *
 * @returns An AccessibilityFeature for focus indicator control.
 */
export function createFocusIndicatorsFeature(): AccessibilityFeature {
  return {
    id: "focusIndicators",
    label: "Enhanced focus indicators",
    description: "Makes keyboard focus rings more visible.",
    control: { type: "toggle" },
    getValue: (prefs) => prefs.focusIndicators,
    apply: (value) => {
      document.documentElement.setAttribute(
        "data-focus-visible",
        String(value),
      );
    },
    reset: () => {
      document.documentElement.removeAttribute("data-focus-visible");
    },
  };
}

// =============================================================================
// FEATURE SET BUILDER
// Pure factory that assembles the default built-in feature set.
// Separated so consumers can pick individual features or replace them.
// =============================================================================

/**
 * Builds the default set of built-in accessibility features.
 *
 * Pure factory function — creates a new array each time.
 * Pass the result to the `features` prop of `AccessibilityPanel`
 * alongside any custom features.
 *
 * @param contentSelector - CSS selector for the content wrapper element.
 *   Used by the text size feature to scope font size changes.
 *   @default ".app-content"
 *
 * @returns An array of built-in AccessibilityFeature objects.
 *
 * @example All built-in features
 * ```tsx
 * <AccessibilityPanel features={buildDefaultFeatures()} />
 * ```
 *
 * @example Built-ins plus a custom feature
 * ```tsx
 * <AccessibilityPanel
 *   features={[
 *     ...buildDefaultFeatures(),
 *     {
 *       id: "dyslexia-font",
 *       label: "Dyslexia-friendly font",
 *       control: { type: "toggle" },
 *       getValue: (prefs) => false,
 *       apply: (enabled) => document.documentElement.classList.toggle("font-dyslexia", enabled as boolean),
 *       reset: () => document.documentElement.classList.remove("font-dyslexia"),
 *     }
 *   ]}
 * />
 * ```
 *
 * @example Only specific built-in features
 * ```tsx
 * <AccessibilityPanel
 *   features={[
 *     createColorModeFeature(),
 *     createReduceMotionFeature(),
 *   ]}
 * />
 * ```
 */
export function buildDefaultFeatures(
  contentSelector: string = ".app-content",
): AccessibilityFeature[] {
  return [
    createColorModeFeature(),
    createTextSizeFeature(contentSelector),
    createReduceMotionFeature(),
    createHighContrastFeature(),
    createFocusIndicatorsFeature(),
  ];
}
