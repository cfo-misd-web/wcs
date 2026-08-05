import { z } from "zod";

// =============================================================================
// PRESETS & CONFIGURATION
// Presets for max-widths, fluid padding, and fluid typography ranges.
// Typography uses clamp() with rem + cqw for WCAG 1.4.4 zoom accessibility.
// =============================================================================

export const CONTAINER_SIZES = ["sm", "md", "lg", "xl", "full"] as const;
export type ContainerSize = (typeof CONTAINER_SIZES)[number];

/**
 * Structural preset configurations.
 */
export const CONTAINER_PRESETS = {
  sm: {
    maxWidth: "max-w-screen-sm",
    padding: "px-4 sm:px-6",
  },
  md: {
    maxWidth: "max-w-screen-md",
    padding: "px-4 sm:px-8",
  },
  lg: {
    maxWidth: "max-w-screen-lg",
    padding: "px-6 sm:px-12",
  },
  xl: {
    maxWidth: "max-w-screen-xl",
    padding: "px-6 sm:px-16",
  },
  full: {
    maxWidth: "max-w-full",
    padding: "px-4 sm:px-6",
  },
} as const satisfies Record<
  ContainerSize,
  { maxWidth: string; padding: string }
>;

/**
 * Fluid typography CSS Custom Properties generated on the container root.
 * Values scale fluidly based on container width (cqw) rather than viewport (vw).
 */
export const FLUID_TYPOGRAPHY_VARS = {
  "--fluid-heading-xl": "clamp(2rem, 1.5rem + 3cqw, 3.75rem)",
  "--fluid-heading-lg": "clamp(1.5rem, 1.25rem + 2cqw, 2.75rem)",
  "--fluid-heading-md": "clamp(1.25rem, 1.1rem + 1.2cqw, 2rem)",
  "--fluid-body": "clamp(1rem, 0.95rem + 0.5cqw, 1.25rem)",
  "--fluid-sm": "clamp(0.875rem, 0.85rem + 0.25cqw, 1rem)",
} as const;

// =============================================================================
// SCHEMA
// =============================================================================

export const ContainerConfigSchema = z.object({
  size: z.enum(CONTAINER_SIZES).default("lg"),
  as: z
    .enum(["div", "section", "main", "article", "header", "footer"])
    .default("div"),
  center: z.boolean().default(true),
});

export type ContainerConfig = z.infer<typeof ContainerConfigSchema>;

// =============================================================================
// PURE UTILITIES
// =============================================================================

/**
 * Generates an inline style object containing fluid typography CSS variables.
 * Pure function — deterministic and easily testable.
 */
export function getFluidTypographyStyles(): React.CSSProperties {
  return { ...FLUID_TYPOGRAPHY_VARS } as React.CSSProperties;
}
