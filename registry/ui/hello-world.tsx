"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export function HelloWorld() {
  const [count, setCount] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">
        Hello from the webdev-components-system registry.
      </p>
      <Button onClick={() => setCount((c) => c + 1)}>
        Clicked {count} {count === 1 ? "time" : "times"}
      </Button>
    </div>
  )
}
