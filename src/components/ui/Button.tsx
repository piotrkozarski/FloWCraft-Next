import { cn } from '../../utils/cn'

export function Button(
  {variant='primary', className='', ...props}:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?:'primary'|'secondary'|'outline'}
){
  const base='inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all'
  const map={
    primary:'bg-hordeRed text-white hover:bg-hordeRed/80 shadow-horde-glow-sm border border-hordeBorder',
    secondary:'bg-hordeDark text-hordeAccent hover:bg-hordeRed/70 border border-hordeBorder',
    outline:'border border-hordeBorder text-hordeAccent hover:bg-hordeRed/20'
  }
  return <button {...props} className={cn(base, map[variant], className)} />
}