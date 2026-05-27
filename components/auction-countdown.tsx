'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AuctionCountdownProps {
  endsAt: string
  size?: 'sm' | 'md'
}

export function AuctionCountdown({ endsAt, size = 'sm' }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculate = () => {
      const end = new Date(endsAt).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Encerrado')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setIsUrgent(diff < 24 * 60 * 60 * 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (size === 'md') {
    return (
      <div className={`flex items-center gap-2 rounded-lg px-4 py-3 ${
        isExpired ? 'bg-muted' : isUrgent ? 'bg-red-50 border border-red-200' : 'bg-primary/5 border border-primary/20'
      }`}>
        <Clock className={`h-5 w-5 shrink-0 ${isExpired ? 'text-muted-foreground' : isUrgent ? 'text-red-500' : 'text-primary'}`} />
        <div>
          <p className="text-xs text-muted-foreground">
            {isExpired ? 'Leilão encerrado' : isUrgent ? '⚡ Encerrando em breve!' : 'Tempo restante'}
          </p>
          <p className={`text-lg font-bold ${isExpired ? 'text-muted-foreground' : isUrgent ? 'text-red-500' : 'text-foreground'}`}>
            {timeLeft}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Badge
      variant={isExpired ? 'secondary' : isUrgent ? 'destructive' : 'outline'}
      className="flex items-center gap-1 text-xs"
    >
      <Clock className="h-3 w-3" />
      {timeLeft}
    </Badge>
  )
}