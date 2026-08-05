import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@registry/ui/container'
import { CONTAINER_SIZES } from '@registry/lib/container/validation'

function ContainerTestPage() {
  return (
    <div className="flex flex-col gap-16 py-10">
      {/* Page Header */}
      <Container size="xl" as="header">
        <h1 className="text-[length:var(--fluid-heading-xl)] font-bold text-kumo-default tracking-tight">
          Container & Fluid Typography
        </h1>
        <p className="text-[length:var(--fluid-body)] text-kumo-subtle mt-2">
          Resize the browser window or use DevTools container query overrides to
          inspect fluid behavior (`cqw`).
        </p>
      </Container>

      {/* 1. Fluid Typography Hierarchy */}
      <Container
        size="lg"
        as="section"
        className="border-b border-kumo-line pb-10"
      >
        <h2 className="text-kumo-subtle text-xs font-semibold uppercase tracking-wider mb-6">
          1. Fluid Typography Scaling
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-kumo-subtle text-xs">--fluid-heading-xl</span>
            <h1 className="text-[length:var(--fluid-heading-xl)] font-extrabold text-kumo-default leading-tight">
              Extra Large Heading
            </h1>
          </div>
          <div>
            <span className="text-kumo-subtle text-xs">--fluid-heading-lg</span>
            <h2 className="text-[length:var(--fluid-heading-lg)] font-bold text-kumo-default leading-snug">
              Large Section Heading
            </h2>
          </div>
          <div>
            <span className="text-kumo-subtle text-xs">--fluid-heading-md</span>
            <h3 className="text-[length:var(--fluid-heading-md)] font-semibold text-kumo-default">
              Medium Subheading
            </h3>
          </div>
          <div>
            <span className="text-kumo-subtle text-xs">--fluid-body</span>
            <p className="text-[length:var(--fluid-body)] text-kumo-default">
              Standard fluid body text. Designed with a minimum{' '}
              <code className="text-xs bg-kumo-tint px-1 py-0.5 rounded">
                rem
              </code>{' '}
              baseline so Cmd/Ctrl + + zoom works flawlessly (WCAG 1.4.4
              compliant).
            </p>
          </div>
          <div>
            <span className="text-kumo-subtle text-xs">--fluid-sm</span>
            <p className="text-[length:var(--fluid-sm)] text-kumo-subtle">
              Small caption or helper text scaling subtly across container
              widths.
            </p>
          </div>
        </div>
      </Container>

      {/* 2. Container Sizing Presets */}
      <section className="flex flex-col gap-6">
        <Container size="lg">
          <h2 className="text-kumo-subtle text-xs font-semibold uppercase tracking-wider">
            2. Preset Width Boundaries
          </h2>
        </Container>

        <div className="flex flex-col gap-4 bg-kumo-tint/50 py-6">
          {CONTAINER_SIZES.map((size) => (
            <Container key={size} size={size}>
              <div className="bg-kumo-surface border border-kumo-line rounded-lg p-4 flex items-center justify-between shadow-sm">
                <span className="font-mono text-xs font-bold uppercase text-kumo-default">
                  size="{size}"
                </span>
                <span className="text-kumo-subtle text-xs">
                  Max width & responsive padding
                </span>
              </div>
            </Container>
          ))}
        </div>
      </section>

      {/* 3. ClassNames & Style Overrides */}
      <Container size="lg" as="section">
        <h2 className="text-kumo-subtle text-xs font-semibold uppercase tracking-wider mb-4">
          3. Custom ClassNames & Semantic HTML
        </h2>
        <Container
          as="article"
          size="md"
          classNames={{
            root: 'bg-kumo-surface border border-kumo-line rounded-xl shadow-md overflow-hidden',
            inner: 'py-8 px-6 sm:px-10',
          }}
        >
          <h3 className="text-[length:var(--fluid-heading-lg)] font-bold text-kumo-default">
            Rendered as &lt;article&gt;
          </h3>
          <p className="text-[length:var(--fluid-body)] text-kumo-subtle mt-3">
            This card uses custom{' '}
            <code className="text-xs bg-kumo-tint px-1 py-0.5 rounded">
              classNames
            </code>{' '}
            overrides to style both the container boundary (
            <code className="text-xs bg-kumo-tint px-1 py-0.5 rounded">
              root
            </code>
            ) and the padded content box (
            <code className="text-xs bg-kumo-tint px-1 py-0.5 rounded">
              inner
            </code>
            ).
          </p>
        </Container>
      </Container>

      {/* 4. Nesting & Container Query Isolation */}
      <Container size="xl" as="section">
        <h2 className="text-kumo-subtle text-xs font-semibold uppercase tracking-wider mb-4">
          4. Container Query Context Isolation
        </h2>
        <p className="text-kumo-subtle text-xs mb-6">
          Typography in split columns scales independently based on each column
          container's width, not the screen width.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Container
              size="full"
              classNames={{
                root: 'bg-kumo-tint/60 rounded-lg p-4 border border-kumo-line h-full',
              }}
            >
              <span className="text-xs text-kumo-subtle font-mono">
                1/3 Sidebar Container
              </span>
              <h4 className="text-[length:var(--fluid-heading-md)] font-bold text-kumo-default mt-2">
                Compact Container Heading
              </h4>
              <p className="text-[length:var(--fluid-body)] text-kumo-subtle mt-2">
                Adapts fluidly to the narrow 33% column width.
              </p>
            </Container>
          </div>

          <div className="md:col-span-2">
            <Container
              size="full"
              classNames={{
                root: 'bg-kumo-tint/60 rounded-lg p-4 border border-kumo-line h-full',
              }}
            >
              <span className="text-xs text-kumo-subtle font-mono">
                2/3 Main Container
              </span>
              <h4 className="text-[length:var(--fluid-heading-md)] font-bold text-kumo-default mt-2">
                Wider Container Heading
              </h4>
              <p className="text-[length:var(--fluid-body)] text-kumo-subtle mt-2">
                Adapts fluidly to the wider 66% column width.
              </p>
            </Container>
          </div>
        </div>
      </Container>
    </div>
  )
}

export const Route = createFileRoute('/test-container')({
  component: ContainerTestPage,
})
