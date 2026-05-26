'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/formatters'
import { CreditCard, QrCode, FileText, ChevronRight } from 'lucide-react'

interface InstallmentsInfoProps {
  price: number
}

export function InstallmentsInfo({ price }: InstallmentsInfoProps) {
  const installments = [1, 2, 3, 4, 5, 6, 10, 12]
  const pixDiscount = price * 0.05
  const pixPrice = price - pixDiscount

  const paymentMethods = [
    {
      icon: QrCode,
      label: 'PIX',
      description: `${formatCurrency(pixPrice)} — 5% de desconto`,
      highlight: true,
    },
    {
      icon: CreditCard,
      label: 'Cartão de Crédito',
      description: `Até 12x de ${formatCurrency(price / 12)} sem juros`,
      highlight: false,
    },
    {
      icon: FileText,
      label: 'Boleto',
      description: `${formatCurrency(price)} — vence em 3 dias úteis`,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-3">
      {/* Destaque PIX */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <p className="text-sm font-medium text-primary">
          💰 {formatCurrency(pixPrice)} no PIX
        </p>
        <p className="text-xs text-muted-foreground">5% de desconto à vista</p>
      </div>

      {/* Parcelamento */}
      <div>
        <p className="text-sm text-muted-foreground">
          ou <span className="font-semibold text-foreground">12x de {formatCurrency(price / 12)}</span> sem juros no cartão
        </p>
      </div>

      {/* Ver métodos de pagamento */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-1 text-sm text-primary hover:underline">
            Ver meios de pagamento
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meios de pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Métodos */}
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.label}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      method.highlight ? 'border-primary/30 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tabela de parcelamento */}
            <div>
              <p className="text-sm font-semibold mb-2">Parcelamento no cartão</p>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-medium">Parcelas</th>
                      <th className="px-3 py-2 text-right font-medium">Valor</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((n) => (
                      <tr key={n} className="border-t border-border">
                        <td className="px-3 py-2">{n}x</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(price / n)}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{formatCurrency(price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">* Parcelamento sem juros</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}