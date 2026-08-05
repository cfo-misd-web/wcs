"use client";

import * as React from "react";
import {
  CONTAINER_PRESETS,
  getFluidTypographyStyles,
  type ContainerSize,
} from "@/lib/container/validation";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Style overrides for each distinct visual part of the Container.
 * Keys are optional — values are Tailwind class strings merged via cn().
 */
export interface ContainerClassNames {
  /** Outermost wrapper establishing the container query context (@container). */
  root?: string;
  /** Inner content wrapper enforcing max-width, centering, and fluid padding. */
  inner?: string;
}

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Predefined container size controlling max-width and fluid padding.
   * @default "lg"
   */
  size?: ContainerSize;

  /**
   * HTML element type to render for semantic structure.
   * @default "div"
   */
  as?: "div" | "section" | "main" | "article" | "header" | "footer";

  /**
   * Whether to horizontally center the inner container.
   * @default true
   */
  center?: boolean;

  /**
   * Custom style overrides for individual parts.
   */
  classNames?: ContainerClassNames;

  /**
   * Child nodes.
   */
  children?: React.ReactNode;
}

// =============================================================================
// DEFAULT STYLES
// Uses Kumo UI compatibility principles and Tailwind container queries (@container).
// =============================================================================

const DEFAULT_STYLES = {
  root: "@container w-full min-w-0",
  inner: "w-full transition-all duration-200",
} as const satisfies Record<keyof ContainerClassNames, string>;

// =============================================================================
// STYLE HELPERS
// =============================================================================

/**
 * Resolves the final class string for a component part.
 * Pure function.
 */
function resolvePart(
  part: keyof ContainerClassNames,
  overrides?: ContainerClassNames,
  additionalClasses?: string,
): string {
  return cn(DEFAULT_STYLES[part], additionalClasses, overrides?.[part]);
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A responsive, mobile-ready container component featuring container-query-based (`cqw`)
 * fluid typography and padding.
 *
 * Exposes CSS variables (`--fluid-heading-xl`, `--fluid-body`, etc.) on the root wrapper,
 * allowing child elements to scale fluidly while remaining fully zoom-accessible (WCAG 1.4.4).
 *
 * @example Basic Usage
 * ```tsx
 * <Container size="lg">
 *   <h1 className="text-[length:var(--fluid-heading-xl)] font-bold text-kumo-default">
 *     Fluid Heading
 *   </h1>
 *   <p className="text-[length:var(--fluid-body)] text-kumo-subtle">
 *     Scales based on container width rather than viewport width.
 *   </p>
 * </Container>
 * ```
 *
 * @example Semantic Section with Style Overrides
 * ```tsx
 * <Container "bg-kumo-surface "border * as="section" border-kumo-line classNames="{{" inner: py-12", root: rounded-lg", size="xl" }}>
 *   <h2>Section Title</h2>
 * </Container>
 * ```
 */
export function Container({
  size = "lg",
  as: Component = "div",
  center = true,
  classNames,
  className,
  style,
  children,
  ...props
}: ContainerProps) {
  const preset = CONTAINER_PRESETS[size] ?? CONTAINER_PRESETS.lg;
  const fluidStyles = getFluidTypographyStyles();

  const rootClasses = resolvePart("root", classNames, className);
  const innerClasses = resolvePart(
    "inner",
    classNames,
    cn(preset.maxWidth, preset.padding, center && "mx-auto"),
  );

  return (
    <Component
      className={rootClasses}
      style={{ ...fluidStyles, ...style }}
      {...props}
    >
      <div className={innerClasses}>{children}</div>
    </Component>
  );
}
