import { cn } from "@/lib/utils"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-beauty-primary",
      className
    )}>
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-beauty-primary border-beauty-accent/20",
      className
    )}>
      {children}
    </h2>
  )
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-tight",
      className
    )} style={{color: '#262626'}}>
      {children}
    </h3>
  )
}

export function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight text-beauty-primary",
      className
    )}>
      {children}
    </h4>
  )
}

export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "leading-7 [&:not(:first-child)]:mt-6 text-beauty-primary-light",
      className
    )}>
      {children}
    </p>
  )
}

export function TypographyBlockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn(
      "mt-6 border-l-2 pl-6 italic text-beauty-primary-light border-beauty-accent",
      className
    )}>
      {children}
    </blockquote>
  )
}

export function TypographyInlineCode({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-beauty-secondary px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-beauty-primary",
      className
    )}>
      {children}
    </code>
  )
}

export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-xl text-beauty-primary-light",
      className
    )}>
      {children}
    </p>
  )
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <div className={cn(
      "text-lg font-semibold text-beauty-primary",
      className
    )}>
      {children}
    </div>
  )
}

export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small className={cn(
      "text-sm font-medium leading-none text-beauty-primary-light",
      className
    )}>
      {children}
    </small>
  )
}

export function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-beauty-accent",
      className
    )}>
      {children}
    </p>
  )
}