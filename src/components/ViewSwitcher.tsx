import { Button } from './ui/button'

interface ViewSwitcherProps {
  className?: string
}

export function ViewSwitcher({ className }: ViewSwitcherProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs group (Tasks, Comments, Incident) - placeholder controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" aria-pressed className="font-medium">
            Tasks
          </Button>
          <Button variant="ghost" size="md">
            Comments
          </Button>
          <Button variant="ghost" size="md">
            Incident
          </Button>
        </div>

        {/* Pagination + segmented view control */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" aria-label="Previous">
            
            <span aria-hidden>‹</span>
          </Button>
          <Button variant="outline" size="md" aria-label="Next">
            <span aria-hidden>›</span>
          </Button>

          <div className="ml-2 inline-flex overflow-hidden rounded-lg border border-[hsl(var(--border))]">
            <Button variant="secondary" size="md" className="rounded-none">
              Board
            </Button>
            <Button variant="ghost" size="md" className="rounded-none">
              List
            </Button>
            <Button variant="ghost" size="md" className="rounded-none">
              Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewSwitcher
