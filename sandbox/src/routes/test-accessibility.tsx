// ACCESSIBILITY IS NOT YET FULLY FIXED, WILL COME BACK TO THIS LATER - Gino, Aug. 7, 2026

import { createFileRoute } from '@tanstack/react-router'
import { AccessibilityPanel } from '@registry/ui/accessibility-panel'
import { createLocalStorageAdapter } from '@registry/integrations/accessibility/adapter'
import { buildDefaultFeatures } from '@registry/lib/accessibility/features'
import { useState, useEffect } from 'react'

const adapter = createLocalStorageAdapter()
const features = buildDefaultFeatures('.app-content')

// =============================================================================
// VISUAL CONFIRMATION HELPERS
// Each component visually proves a specific feature is working.
// =============================================================================

function ColorModeConfirmation() {
  const [mode, setMode] = useState<string>('unknown')

  useEffect(() => {
    function read() {
      const attr = document.documentElement.getAttribute('data-mode')
      setMode(attr ?? 'system (no attribute)')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex items-center justify-between rounded-lg border border-kumo-hairline p-3">
      <span className="text-kumo-subtle text-xs">
        data-mode on &lt;html&gt;
      </span>
      <span className="rounded-full bg-kumo-tint px-2 py-0.5 font-mono text-xs text-kumo-default">
        {mode}
      </span>
    </div>
  )
}

function TextSizeConfirmation() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-kumo-hairline p-3">
      <p className="text-kumo-subtle text-xs">
        Text below uses <code>font-size: var(--a11y-text-size, 1rem)</code>
      </p>
      <p className="text-kumo-default">
        The quick brown fox jumps over the lazy dog.
      </p>
      <p className="text-kumo-subtle text-xs">
        Text above scales — text below does not (hardcoded):
      </p>
      <p className="text-kumo-default" style={{ fontSize: '1rem' }}>
        The quick brown fox jumps over the lazy dog. (fixed 1rem)
      </p>
    </div>
  )
}

function ReduceMotionConfirmation() {
  const [active, setActive] = useState(false)
  const [attrValue, setAttrValue] = useState<string>('not set')

  useEffect(() => {
    function read() {
      const val = document.documentElement.getAttribute('data-reduce-motion')
      setAttrValue(val ?? 'not set')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduce-motion'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-kumo-hairline p-3">
      <div className="flex items-center justify-between">
        <span className="text-kumo-subtle text-xs">
          data-reduce-motion on &lt;html&gt;
        </span>
        <span className="rounded-full bg-kumo-tint px-2 py-0.5 font-mono text-xs text-kumo-default">
          {attrValue}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-kumo-subtle text-xs">
          Click the box to animate it. With reduce motion on, the animation
          should be instant (no transition).
        </p>
        <div
          onClick={() => setActive((v) => !v)}
          className="cursor-pointer rounded-lg bg-kumo-tint p-3 text-center text-xs text-kumo-default"
          style={{
            transform: active ? 'translateX(60px)' : 'translateX(0)',
            transition: 'transform 500ms ease-in-out',
          }}
        >
          Click to slide →
        </div>
        <p className="text-kumo-subtle text-xs">
          Note: The animation above uses inline styles for demo purposes. In
          your app, add this to your global CSS to respect the attribute:
        </p>
        <code className="rounded bg-kumo-tint px-2 py-1 text-xs text-kumo-default">
          [data-reduce-motion="true"] *{' '}
          {'{ transition-duration: 0.01ms !important; }'}
        </code>
      </div>
    </div>
  )
}

function HighContrastConfirmation() {
  const [attrValue, setAttrValue] = useState<string>('not set')

  useEffect(() => {
    function read() {
      const val = document.documentElement.getAttribute('data-high-contrast')
      setAttrValue(val ?? 'not set')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-high-contrast'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-kumo-hairline p-3">
      <div className="flex items-center justify-between">
        <span className="text-kumo-subtle text-xs">
          data-high-contrast on &lt;html&gt;
        </span>
        <span className="rounded-full bg-kumo-tint px-2 py-0.5 font-mono text-xs text-kumo-default">
          {attrValue}
        </span>
      </div>
      <p className="text-kumo-subtle text-xs">
        The attribute is set correctly. To visually apply high contrast, add CSS
        variable overrides to your global stylesheet:
      </p>
      <code className="rounded bg-kumo-tint px-2 py-1 text-xs text-kumo-default">
        [data-high-contrast="true"]{' '}
        {'{ --kumo-text-default: #000; --kumo-bg-base: #fff; }'}
      </code>
      <div
        className="rounded-lg border-2 p-3 text-sm"
        style={{
          borderColor: attrValue === 'true' ? '#000000' : undefined,
          backgroundColor: attrValue === 'true' ? '#ffffff' : undefined,
          color: attrValue === 'true' ? '#000000' : undefined,
        }}
      >
        This box applies inline high contrast styles as a live demo.
        {attrValue === 'true'
          ? ' ← High contrast is ON.'
          : ' ← High contrast is OFF.'}
      </div>
    </div>
  )
}

function FocusIndicatorsConfirmation() {
  const [attrValue, setAttrValue] = useState<string>('not set')

  useEffect(() => {
    function read() {
      const val = document.documentElement.getAttribute('data-focus-visible')
      setAttrValue(val ?? 'not set')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-focus-visible'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-kumo-hairline p-3">
      <div className="flex items-center justify-between">
        <span className="text-kumo-subtle text-xs">
          data-focus-visible on &lt;html&gt;
        </span>
        <span className="rounded-full bg-kumo-tint px-2 py-0.5 font-mono text-xs text-kumo-default">
          {attrValue}
        </span>
      </div>
      <p className="text-kumo-subtle text-xs">
        Tab to the buttons below to see focus rings. With enhanced focus
        indicators on, the ring should be thicker and more visible. Add this to
        your global CSS to enable the effect:
      </p>
      <code className="rounded bg-kumo-tint px-2 py-1 text-xs text-kumo-default">
        [data-focus-visible="true"] :focus-visible{' '}
        {'{ outline: 3px solid #005fcc; outline-offset: 3px; }'}
      </code>
      <div className="flex gap-2">
        <button className="rounded-lg border border-kumo-hairline bg-kumo-tint px-3 py-1.5 text-xs text-kumo-default">
          Tab to me
        </button>
        <button className="rounded-lg border border-kumo-hairline bg-kumo-tint px-3 py-1.5 text-xs text-kumo-default">
          Then me
        </button>
        <button className="rounded-lg border border-kumo-hairline bg-kumo-tint px-3 py-1.5 text-xs text-kumo-default">
          Then me
        </button>
      </div>
    </div>
  )
}

function CompactModeConfirmation() {
  const [attrValue, setAttrValue] = useState<string>('not set')

  useEffect(() => {
    function read() {
      const has = document.documentElement.hasAttribute('data-compact')
      setAttrValue(has ? 'true' : 'not set')
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-compact'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-kumo-hairline p-3">
      <div className="flex items-center justify-between">
        <span className="text-kumo-subtle text-xs">
          data-compact on &lt;html&gt;
        </span>
        <span className="rounded-full bg-kumo-tint px-2 py-0.5 font-mono text-xs text-kumo-default">
          {attrValue}
        </span>
      </div>
      <p className="text-kumo-subtle text-xs">
        Custom feature — attribute is set/removed correctly when toggled.
      </p>
    </div>
  )
}

// =============================================================================
// TEST PAGE
// =============================================================================

function AccessibilityTestPage() {
  return (
    <div className="app-content mx-auto flex max-w-xl flex-col gap-10 p-8">
      <h1 className="text-kumo-strong text-xl font-semibold">
        Accessibility Panel Test
      </h1>

      {/* ================================================================
          INLINE — DEFAULT
      ================================================================ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Inline mode (default)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Renders directly in the layout. Consumer controls placement.
        </p>
        <AccessibilityPanel adapter={adapter} features={features} />
      </section>

      {/* ================================================================
          VISUAL CONFIRMATIONS — one per feature
      ================================================================ */}
      <section className="flex flex-col gap-4">
        <h2 className="text-kumo-default text-sm font-medium">
          Visual confirmations
        </h2>
        <p className="text-kumo-subtle text-xs">
          Each section below confirms that its corresponding feature is
          correctly applying changes to the DOM when toggled above.
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-kumo-default text-xs font-medium">Color mode</p>
          <ColorModeConfirmation />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-kumo-default text-xs font-medium">Text size</p>
          <TextSizeConfirmation />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-kumo-default text-xs font-medium">Reduce motion</p>
          <ReduceMotionConfirmation />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-kumo-default text-xs font-medium">High contrast</p>
          <HighContrastConfirmation />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-kumo-default text-xs font-medium">
            Enhanced focus indicators
          </p>
          <FocusIndicatorsConfirmation />
        </div>
      </section>

      {/* ================================================================
          INLINE — CUSTOM CLASSNAMES
      ================================================================ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Inline — custom classNames
        </h2>
        <AccessibilityPanel
          adapter={adapter}
          features={features}
          classNames={{
            panel:
              'w-full border border-kumo-hairline rounded-xl bg-kumo-elevated p-5',
            title: 'text-kumo-strong text-base font-semibold',
          }}
        />
      </section>

      {/* ================================================================
          CUSTOM INJECTED FEATURE
      ================================================================ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          With custom injected feature
        </h2>
        <p className="text-kumo-subtle text-xs">
          A custom "Compact mode" feature injected alongside built-ins.
        </p>
        <AccessibilityPanel
          adapter={adapter}
          features={[
            ...features,
            {
              id: 'compact-mode',
              label: 'Compact mode',
              description: 'Reduces spacing throughout the interface.',
              control: { type: 'toggle' },
              getValue: () =>
                document.documentElement.hasAttribute('data-compact'),
              apply: (v: unknown) =>
                document.documentElement.toggleAttribute(
                  'data-compact',
                  v as boolean,
                ),
              reset: () =>
                document.documentElement.removeAttribute('data-compact'),
            },
          ]}
        />
        <CompactModeConfirmation />
      </section>

      {/* ================================================================
          FLOATING PANELS
      ================================================================ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Floating mode — bottom right (default trigger)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Look for the accessibility icon button fixed to the bottom-right of
          the viewport.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Floating mode — bottom left with custom trigger
        </h2>
        <p className="text-kumo-subtle text-xs">
          Look for the custom trigger button fixed to the bottom-left of the
          viewport.
        </p>
      </section>

      <AccessibilityPanel
        adapter={adapter}
        features={features}
        float
        position="bottom-right"
      />

      <AccessibilityPanel
        adapter={adapter}
        features={features}
        float
        position="bottom-left"
        trigger={
          <button className="rounded-lg bg-kumo-brand px-3 py-2 text-xs text-white">
            A11y Settings
          </button>
        }
      />
    </div>
  )
}

export const Route = createFileRoute('/test-accessibility')({
  component: AccessibilityTestPage,
})
