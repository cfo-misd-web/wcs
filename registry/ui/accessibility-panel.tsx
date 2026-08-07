"use client";

import * as React from "react";
import { Button, Switch, Select } from "@cloudflare/kumo";
import { PersonArmsSpreadIcon } from "@phosphor-icons/react";
import type { AccessibilityStorageAdapter } from "@/integrations/accessibility/adapter";
import type { AccessibilityFeature } from "@/lib/accessibility/features";
import type { AccessibilityPreferences } from "@/lib/accessibility/validation";
import {
  DEFAULT_PREFERENCES,
  updatePreference,
} from "@/lib/accessibility/validation";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Position of the floating panel trigger button.
 * Only applies when `float={true}`.
 *
 * @example
 * ```tsx
 * <AccessibilityPanel float position="bottom-right" />
 * ```
 */
export type FloatPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Style overrides for each distinct visual part of the AccessibilityPanel.
 * All keys are optional — only override what you need.
 * Values are Tailwind class strings merged on top of defaults via cn().
 *
 * Always use Kumo semantic color tokens (e.g. `text-kumo-subtle`) instead
 * of raw Tailwind colors to ensure light/dark mode compatibility.
 *
 * @example
 * ```tsx
 * classNames={{
 *   panel: "w-80",
 *   featureLabel: "text-kumo-strong",
 * }}
 * ```
 */
export interface AccessibilityPanelClassNames {
  /** The panel container div. */
  panel?: string;
  /** The panel header containing the title and reset button. */
  header?: string;
  /** The panel title text. */
  title?: string;
  /** The list of feature rows. */
  featureList?: string;
  /** Each individual feature row. */
  featureRow?: string;
  /** The feature label text. */
  featureLabel?: string;
  /** The feature description text. */
  featureDescription?: string;
  /** The floating trigger button wrapper. Only applies when float=true. */
  floatTrigger?: string;
}

/**
 * Props for the AccessibilityPanel component.
 */
export interface AccessibilityPanelProps {
  /**
   * Storage adapter for loading and saving preferences.
   * Use `createLocalStorageAdapter()` for browser-only persistence.
   * Implement the `AccessibilityStorageAdapter` interface for custom storage.
   *
   * @example
   * ```tsx
   * import { createLocalStorageAdapter } from "@/integration/accessibility/adapter"
   *
   * <AccessibilityPanel adapter={createLocalStorageAdapter()} ... />
   * ```
   */
  adapter: AccessibilityStorageAdapter;

  /**
   * The list of accessibility features to render in the panel.
   * Use `buildDefaultFeatures()` for all built-in features, or compose
   * your own array using individual `create*Feature()` factories.
   *
   * Custom features can be appended to the array for extensibility.
   *
   * @example All built-in features
   * ```tsx
   * import { buildDefaultFeatures } from "@/lib/accessibility/features"
   *
   * <AccessibilityPanel features={buildDefaultFeatures()} ... />
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
   *       getValue: () => document.documentElement.classList.contains("font-dyslexia"),
   *       apply: (v) => document.documentElement.classList.toggle("font-dyslexia", v as boolean),
   *       reset: () => document.documentElement.classList.remove("font-dyslexia"),
   *     }
   *   ]}
   *   ...
   * />
   * ```
   */
  features: AccessibilityFeature[];

  /**
   * When `true`, renders the panel as a floating widget fixed to the
   * viewport. A trigger button toggles the panel open and closed.
   *
   * When `false` or omitted, renders inline — the consumer controls
   * placement by positioning the component in their layout.
   *
   * @default false
   * @optional
   */
  float?: boolean;

  /**
   * Position of the floating trigger button and panel.
   * Only applies when `float={true}`.
   *
   * @default "bottom-right"
   * @optional
   *
   * @example
   * ```tsx
   * <AccessibilityPanel float position="bottom-left" ... />
   * ```
   */
  position?: FloatPosition;

  /**
   * Custom trigger element for the floating panel.
   * Only applies when `float={true}`.
   *
   * When omitted, renders a default Kumo ghost button with an
   * accessibility icon.
   *
   * @optional
   *
   * @example
   * ```tsx
   * <AccessibilityPanel
   *   float
   *   trigger={<Button variant="secondary">Accessibility</Button>}
   *   ...
   * />
   * ```
   */
  trigger?: React.ReactNode;

  /**
   * Tailwind class overrides for each visual part of the component.
   * Always use Kumo semantic color tokens instead of raw Tailwind colors.
   *
   * @optional
   */
  classNames?: AccessibilityPanelClassNames;
}

// =============================================================================
// DEFAULT STYLES
// Pure style data for each styleable part of the component.
// All colors use Kumo semantic tokens for light/dark mode compatibility.
// =============================================================================

/**
 * Default Tailwind styles for each named part of the component.
 * Consumer classNames are merged on top via cn().
 * All colors use Kumo semantic tokens.
 */
const DEFAULT_STYLES = {
  panel:
    "flex w-72 flex-col gap-4 rounded-xl border border-kumo-hairline bg-kumo-base p-4 shadow-md",
  header: "flex items-center justify-between",
  title: "text-kumo-strong text-sm font-medium",
  featureList: "flex flex-col gap-3",
  featureRow: "flex items-center justify-between gap-4",
  featureLabel: "text-kumo-default text-sm",
  featureDescription: "text-kumo-subtle text-xs",
  floatTrigger: "",
} as const satisfies Record<keyof AccessibilityPanelClassNames, string>;

// =============================================================================
// STYLE HELPERS
// Pure functions that resolve final class strings for each part.
// =============================================================================

/**
 * Resolves the final className for a given component part by merging
 * the default style with any consumer override via cn().
 *
 * Pure function — same inputs always produce the same output.
 *
 * @param part - The component part key from AccessibilityPanelClassNames.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string.
 */
function resolvePart(
  part: keyof AccessibilityPanelClassNames,
  overrides?: AccessibilityPanelClassNames,
): string {
  return cn(DEFAULT_STYLES[part], overrides?.[part]);
}

// =============================================================================
// POSITION HELPERS
// Pure functions for computing float position styles.
// =============================================================================

/**
 * Resolves the Tailwind positioning classes for a given float position.
 *
 * Pure function — same input always produces the same output.
 *
 * @param position - The desired float position.
 * @returns Tailwind classes for fixed positioning.
 *
 * @example
 * ```ts
 * resolveFloatPosition("bottom-right") // → "fixed bottom-6 right-6 z-50"
 * resolveFloatPosition("top-left")     // → "fixed top-6 left-6 z-50"
 * ```
 */
function resolveFloatPosition(position: FloatPosition): string {
  const map: Record<FloatPosition, string> = {
    "top-left": "fixed top-6 left-6 z-50",
    "top-right": "fixed top-6 right-6 z-50",
    "bottom-left": "fixed bottom-6 left-6 z-50",
    "bottom-right": "fixed bottom-6 right-6 z-50",
  };
  return map[position];
}

/**
 * Resolves the Tailwind classes for positioning the panel relative
 * to the float trigger button.
 *
 * Pure function — no side effects.
 *
 * @param position - The float position of the trigger.
 * @returns Tailwind classes for panel placement.
 */
function resolvePanelPlacement(position: FloatPosition): string {
  const map: Record<FloatPosition, string> = {
    "top-left": "absolute top-full left-0 mt-2",
    "top-right": "absolute top-full right-0 mt-2",
    "bottom-left": "absolute bottom-full left-0 mb-2",
    "bottom-right": "absolute bottom-full right-0 mb-2",
  };
  return map[position];
}

// =============================================================================
// FEATURE CONTROL RENDERER
// A pure rendering function that maps a feature's control type to a
// Kumo UI control. Separated from the component so it stays testable
// and does not mix rendering concerns with state management.
// =============================================================================

/**
 * Renders the appropriate Kumo control for a given feature.
 *
 * Pure rendering function — same inputs always produce the same output.
 * Handles toggle, select, and range control types.
 *
 * @param feature - The feature to render a control for.
 * @param value - The current value of the feature.
 * @param onChange - Callback fired when the value changes.
 * @returns The rendered Kumo control element.
 */
function FeatureControl({
  feature,
  value,
  onChange,
}: {
  feature: AccessibilityFeature;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (feature.control.type === "toggle") {
    return (
      <Switch
        checked={value as boolean}
        onCheckedChange={(checked) => onChange(checked)}
        aria-label={feature.label}
      />
    );
  }

  if (feature.control.type === "select") {
    return (
      <Select
        value={value as string}
        onValueChange={(val) => onChange(val)}
        aria-label={feature.label}
        size="sm"
        items={Object.fromEntries(
          feature.control.options.map((opt) => [opt.value, opt.label]),
        )}
      />
    );
  }

  return null;
}

// =============================================================================
// PANEL CONTENT
// The inner panel UI — separated from the float/inline wrapper logic.
// Responsible only for rendering the list of features and the reset button.
// =============================================================================

/**
 * Renders the accessibility panel content — title, feature list, and reset.
 * Used by both the inline and floating variants.
 */
function PanelContent({
  features,
  preferences,
  onFeatureChange,
  onReset,
  classNames,
}: {
  features: AccessibilityFeature[];
  preferences: AccessibilityPreferences;
  onFeatureChange: (feature: AccessibilityFeature, value: unknown) => void;
  onReset: () => void;
  classNames?: AccessibilityPanelClassNames;
}) {
  return (
    <div className={resolvePart("panel", classNames)}>
      <div className={resolvePart("header", classNames)}>
        <h2 className={resolvePart("title", classNames)}>Accessibility</h2>
        <Button
          variant="ghost"
          size="xs"
          onClick={onReset}
          aria-label="Reset all accessibility preferences to defaults"
        >
          Reset
        </Button>
      </div>

      <ul
        className={resolvePart("featureList", classNames)}
        aria-label="Accessibility settings"
      >
        {features.map((feature) => (
          <li
            key={feature.id}
            className={resolvePart("featureRow", classNames)}
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span
                className={resolvePart("featureLabel", classNames)}
                id={`a11y-feature-${feature.id}`}
              >
                {feature.label}
              </span>
              {feature.description && (
                <span className={resolvePart("featureDescription", classNames)}>
                  {feature.description}
                </span>
              )}
            </div>
            <div className="shrink-0">
              <FeatureControl
                feature={feature}
                value={feature.getValue(preferences)}
                onChange={(value) => onFeatureChange(feature, value)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// COMPONENT
// Responsible only for state management and delegating to PanelContent.
// Contains no feature-specific logic — features are injected via props.
// =============================================================================

/**
 * Accessibility panel that lets users control display preferences.
 *
 * Renders a list of accessibility features — color mode, text size,
 * reduce motion, high contrast, focus indicators, and any custom features
 * injected via the `features` prop. Preferences are persisted via the
 * injected `adapter`.
 *
 * Supports two presentation modes:
 * - **Inline** (default) — renders directly in the layout. Consumer controls placement.
 * - **Floating** (`float={true}`) — fixed to the viewport with a toggle trigger.
 *
 * Stays storage-agnostic via the `adapter` prop. Use `createLocalStorageAdapter()`
 * for browser-only persistence, or implement `AccessibilityStorageAdapter`
 * for server-side sync.
 *
 * New features can be injected without modifying the component — pass
 * any object matching `AccessibilityFeature` in the `features` array.
 *
 * @remarks
 * **CSS setup required for some features:**
 *
 * Text size — add to your content wrapper:
 * ```css
 * .app-content { font-size: var(--a11y-text-size, 1rem); }
 * ```
 *
 * High contrast — add to your global CSS:
 * ```css
 * [data-high-contrast="true"] {
 *   --kumo-text-default: #000000;
 *   --kumo-bg-base: #ffffff;
 * }
 * ```
 *
 * Reduce motion — add to your global CSS:
 * ```css
 * [data-reduce-motion="true"] * {
 *   animation-duration: 0.01ms !important;
 *   transition-duration: 0.01ms !important;
 * }
 * ```
 *
 * Focus indicators — add to your global CSS:
 * ```css
 * [data-focus-visible="true"] :focus-visible {
 *   outline: 3px solid #005fcc;
 *   outline-offset: 3px;
 * }
 * ```
 *
 * @example Inline
 * ```tsx
 * import { createLocalStorageAdapter } from "@/integration/accessibility/adapter"
 * import { buildDefaultFeatures } from "@/lib/accessibility/features"
 *
 * <AccessibilityPanel
 *   adapter={createLocalStorageAdapter()}
 *   features={buildDefaultFeatures()}
 * />
 * ```
 *
 * @example Floating — bottom right
 * ```tsx
 * <AccessibilityPanel
 *   adapter={createLocalStorageAdapter()}
 *   features={buildDefaultFeatures()}
 *   float
 *   position="bottom-right"
 * />
 * ```
 *
 * @example Floating — custom trigger
 * ```tsx
 * <AccessibilityPanel
 *   adapter={createLocalStorageAdapter()}
 *   features={buildDefaultFeatures()}
 *   float
 *   position="bottom-right"
 *   trigger={<Button variant="secondary">Accessibility</Button>}
 * />
 * ```
 *
 * @example With custom feature
 * ```tsx
 * <AccessibilityPanel
 *   adapter={createLocalStorageAdapter()}
 *   features={[
 *     ...buildDefaultFeatures(),
 *     {
 *       id: "dyslexia-font",
 *       label: "Dyslexia-friendly font",
 *       description: "Uses OpenDyslexic for easier reading.",
 *       control: { type: "toggle" },
 *       getValue: () => document.documentElement.classList.contains("font-dyslexia"),
 *       apply: (v) => document.documentElement.classList.toggle("font-dyslexia", v as boolean),
 *       reset: () => document.documentElement.classList.remove("font-dyslexia"),
 *     }
 *   ]}
 * />
 * ```
 *
 * @example With style overrides
 * ```tsx
 * <AccessibilityPanel
 *   adapter={createLocalStorageAdapter()}
 *   features={buildDefaultFeatures()}
 *   classNames={{ panel: "w-80", title: "text-kumo-strong" }}
 * />
 * ```
 */
export function AccessibilityPanel({
  adapter,
  features,
  float = false,
  position = "bottom-right",
  trigger,
  classNames,
}: AccessibilityPanelProps) {
  const [preferences, setPreferences] =
    React.useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load preferences from storage on mount and apply them to the DOM
  React.useEffect(() => {
    adapter.load().then((prefs) => {
      setPreferences(prefs);
      features.forEach((feature) => {
        feature.apply(feature.getValue(prefs));
      });
      setIsLoaded(true);
    });
  }, []);

  // Handles a single feature value change —
  // updates state, applies to DOM, persists to storage
  function handleFeatureChange(feature: AccessibilityFeature, value: unknown) {
    const key = feature.id as keyof AccessibilityPreferences;
    const next = updatePreference(
      preferences,
      key,
      value as AccessibilityPreferences[typeof key],
    );
    setPreferences(next);
    feature.apply(value);
    adapter.save(next);
  }

  // Resets all features to defaults —
  // resets DOM, clears state, persists defaults to storage
  function handleReset() {
    features.forEach((feature) => feature.reset());
    setPreferences(DEFAULT_PREFERENCES);
    adapter.save(DEFAULT_PREFERENCES);
  }

  // Don't render until preferences are loaded to avoid flash of wrong state
  if (!isLoaded) return null;

  const panelContent = (
    <PanelContent
      features={features}
      preferences={preferences}
      onFeatureChange={handleFeatureChange}
      onReset={handleReset}
      classNames={classNames}
    />
  );

  // ─── Inline mode ───────────────────────────────────────────────────────────
  if (!float) {
    return panelContent;
  }

  // ─── Floating mode ─────────────────────────────────────────────────────────
  const defaultTrigger = (
    <Button
      variant="ghost"
      shape="square"
      aria-label="Open accessibility settings"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onClick={() => setIsOpen((v) => !v)}
    >
      <PersonArmsSpreadIcon size={20} />
    </Button>
  );

  return (
    <div
      className={cn(
        resolveFloatPosition(position),
        resolvePart("floatTrigger", classNames),
      )}
    >
      <div className="relative">
        <div onClick={() => setIsOpen((v) => !v)}>
          {trigger ?? defaultTrigger}
        </div>

        {isOpen && (
          <div
            role="dialog"
            aria-label="Accessibility settings"
            aria-modal="false"
            className={
              resolvePart(
                "panelPlacement" as keyof AccessibilityPanelClassNames,
                classNames,
              ) || resolvePanelPlacement(position)
            }
          >
            {panelContent}
          </div>
        )}
      </div>
    </div>
  );
}
