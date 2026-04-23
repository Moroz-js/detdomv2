import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ContainerColumns = 1 | 2 | 3

const columnsClassNames: Record<ContainerColumns, string> = {
  1: 'grid grid-cols-1',
  2: 'grid grid-cols-1 gap-6 md:grid-cols-2',
  3: 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3',
}

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  columns?: ContainerColumns
}

export function Container({ children, className, columns, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-5xl px-4', columns ? columnsClassNames[columns] : '', className)}
      {...props}
    >
      {children}
    </div>
  )
}
