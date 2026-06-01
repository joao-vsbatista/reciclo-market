import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Gavel } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/formatters'
import { PRODUCT_CONDITIONS } from '@/lib/types'
import { AuctionCountdown } from '@/components/auction-countdown'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const isNew = new Date(product.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)

  return (
    <Link href={product.type === 'sale' ? `/vendas/${product.id}` : `/produtos/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl text-muted-foreground/50">📦</span>
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 bg-background/90 backdrop-blur-sm"
          >
            {PRODUCT_CONDITIONS[product.condition]}
          </Badge>

          {isNew && (
            <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
              Novo
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <p className="text-lg font-bold text-primary">
            {formatCurrency(product.min_price)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">mín.</span>
          </p>

          <p className="text-xs text-muted-foreground mb-3">
            12x de {formatCurrency(product.min_price / 12)} sem juros
          </p>

          {/* ✅ CONTADOR REGRESSIVO */}
          {product.ends_at && (
            <div className="mb-3">
              <AuctionCountdown endsAt={product.ends_at} />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{product.city}, {product.state}</span>
            </div>

            {typeof product.bids_count === 'number' && product.bids_count > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <Gavel className="h-3.5 w-3.5" />
                <span>{product.bids_count}</span>
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelativeTime(product.created_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}