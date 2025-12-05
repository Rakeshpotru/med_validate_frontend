import { Card, CardContent, CardHeader } from './ui/card'
import { Progress } from './ui/progress'
import Badge from './ui/badge'

type Avatar = { id: string; name?: string; avatarUrl?: string }

interface ProjectSummaryCardProps {
  title: string
  dueLabel: string
  progress: number
  avatars?: Avatar[]
  overflowCount?: number
  className?: string
}

export function ProjectSummaryCard({
  title,
  dueLabel,
  progress,
  avatars = [],
  overflowCount = 0,
  className,
}: ProjectSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-xs opacity-70">{dueLabel}</p>
          </div>
          <div className="flex items-center -space-x-2">
            {avatars.slice(0, 4).map((a) => (
              <span
                key={a.id}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-black/10 text-xs dark:bg-white/10"
                aria-label={a.name || 'Member'}
              >
                {a.name ? a.name[0] : '•'}
              </span>
            ))}
            {overflowCount > 0 && (
              <Badge className="relative z-10">+{overflowCount}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
      </CardContent>
    </Card>
  )
}

export default ProjectSummaryCard
