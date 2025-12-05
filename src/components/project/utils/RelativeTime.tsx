export interface RelativeTimeProps {
  datetime: Date
}

export default function RelativeTime({ datetime }: RelativeTimeProps) {
  const now = Date.now()
  const diff = now - datetime.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  let text: string
  if (years > 0) {
    text = `${years} Year${years > 1 ? 's' : ''} ago`
  } else if (months > 0) {
    text = `${months} Month${months > 1 ? 's' : ''} ago`
  } else if (days > 0) {
    text = `${days} ${days === 1 ? 'Day' : 'Days'} ago`
  } else if (hours > 0) {
    text = `${hours} Hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    text = `${minutes} Minute${minutes > 1 ? 's' : ''} ago`
  } else {
    text = `${Math.max(0, seconds)} Sec${seconds !== 1 ? 's' : ''} ago`
  }

  return (
    <time dateTime={datetime.toISOString()} className="text-xs text-[hsl(var(--fg))]/60">
      {text}
    </time>
  )
}
