import { ArrowLeft } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; variant?: 'primary' | 'secondary'; onClick: () => void }

export function ActionButton({ children, variant = 'primary', onClick }: Props) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      type="button"
      className={'action action--' + variant}
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span>{children}</span>
      <ArrowLeft aria-hidden="true" strokeWidth={1.8} />
    </motion.button>
  )
}
