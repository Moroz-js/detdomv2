import { cn } from '@/lib/utils'

type Props = {
  src: string
  poster?: string | null
  caption?: string | null
  widthClass?: string
  maxHeightClass?: string
}

export function VideoBlock({ src, poster, caption, widthClass, maxHeightClass }: Props) {
  return (
    <figure className={cn('space-y-2', widthClass || 'w-full')}>
      <video
        className={cn(
          'w-full max-w-full rounded-lg border border-zinc-200 bg-stone-950 object-contain shadow-sm',
          maxHeightClass || 'max-h-[480px]',
        )}
        controls
        playsInline
        preload="metadata"
        poster={poster || undefined}
        src={src}
      >
        <a href={src}>Скачать видео</a>
      </video>
      {caption ? <figcaption className="text-sm text-zinc-600">{caption}</figcaption> : null}
    </figure>
  )
}
