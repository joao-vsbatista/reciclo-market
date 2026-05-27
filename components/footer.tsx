import Link from 'next/link'
import { Gavel, Tag } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gavel className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ReCicloMarket</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} ReCicloMarket. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}