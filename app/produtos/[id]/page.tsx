import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BidForm } from '@/components/bid-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MapPin, Calendar, User, Gavel, Phone, Mail } from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/formatters'
import { PRODUCT_CONDITIONS, PRODUCT_CATEGORIES } from '@/lib/types'
import type { Product, Bid } from '@/lib/types'
import { BidActions } from '@/components/bid-actions'
import { Breadcrumb } from '@/components/breadcrumb'
import { ReviewForm } from '@/components/review-form'
import { ReviewStars } from '@/components/review-stars'
import { AuctionCountdown } from '@/components/auction-countdown'
import { ProductGalleryZoom } from '@/components/product-gallery-zoom'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey(id, name, phone, city, state),
      images:product_images(id, url, is_primary)
    `)
    .eq('id', id)
    .single()
  
  return product
}

async function getProductBids(productId: string, userId?: string): Promise<Bid[]> {
  const supabase = await createClient()
  
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles!bids_bidder_id_fkey(id, name, phone)
    `)
    .eq('product_id', productId)
    .order('amount', { ascending: false })
  
  return bids || []
}

async function getUserAcceptedBid(productId: string, userId: string): Promise<Bid | null> {
  const supabase = await createClient()
  
  const { data: bid } = await supabase
    .from('bids')
    .select(`
      *,
      product:products!bids_product_id_fkey(
        *,
        seller:profiles!products_seller_id_fkey(id, name, phone)
      )
    `)
    .eq('product_id', productId)
    .eq('bidder_id', userId)
    .eq('status', 'accepted')
    .single()
  
  return bid
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  if (!product) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const isOwner = user?.id === product.seller_id
  const bids = isOwner ? await getProductBids(id, user?.id) : []
  const userAcceptedBid = user && !isOwner ? await getUserAcceptedBid(id, user.id) : null
  
  // Check if user already has a pending bid
  let userPendingBid: Bid | null = null
  if (user && !isOwner) {
    const { data } = await supabase
      .from('bids')
      .select('*')
      .eq('product_id', id)
      .eq('bidder_id', user.id)
      .eq('status', 'pending')
      .single()
    userPendingBid = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb items={[
          { label: 'Leilões', href: '/leiloes' },
          { label: product.title }
]} />
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/produtos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Link>
          </Button>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <ProductGalleryZoom images={product.images || []} title={product.title} />
            
            {/* Details */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline">{PRODUCT_CONDITIONS[product.condition]}</Badge>
                  {product.status === 'sold' && (
                    <Badge variant="destructive">Vendido</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {product.title}
                </h1>
                <p className="mt-4 text-3xl font-bold text-primary">
                  {product.ends_at && (
  <div className="mt-4">
    <AuctionCountdown endsAt={product.ends_at} size="md" />
  </div>
)}
                  {formatCurrency(product.min_price)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    preço mínimo
                  </span>
                </p>
              </div>
              
              <Separator />
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {product.city}, {product.state}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Publicado {formatRelativeTime(product.created_at)}
                </div>
              </div>
              
              <div>
                <h2 className="mb-2 text-lg font-semibold text-foreground">Descrição</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {product.description}
                </p>
              </div>
              
              <Separator />
              
              {/* Seller info */}
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-base">
      <User className="h-4 w-4" />
      Vendedor
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Link
      href={`/vendedor/${product.seller_id}`}
      className="font-medium text-foreground hover:text-primary transition-colors"
    >
      {product.seller?.name}
    </Link>
    <p className="text-sm text-muted-foreground">
      {product.seller?.city}, {product.seller?.state}
    </p>
    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
      <Link href={`/vendedor/${product.seller_id}`}>
        Ver perfil do vendedor
      </Link>
    </Button>
  </CardContent>
</Card>
              
              {/* Show accepted bid contact info */}
              {userAcceptedBid && (
                <Card className="border-success bg-success/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-success">
                      <Gavel className="h-4 w-4" />
                      Lance Aceito!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Seu lance de {formatCurrency(userAcceptedBid.amount)} foi aceito.
                      Entre em contato com o vendedor:
                    </p>
                    {product.seller?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{product.seller.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Avaliação pós-venda */}
{userAcceptedBid && (
  <ReviewForm
    productId={product.id}
    reviewedId={product.seller_id}
    reviewerId={user!.id}
    reviewedName={product.seller?.name || 'Vendedor'}
  />
)}
              
              {/* User's pending bid */}
              {userPendingBid && !userAcceptedBid && (
                <Card className="border-warning bg-warning/5">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      Você já fez um lance de{' '}
                      <span className="font-semibold">{formatCurrency(userPendingBid.amount)}</span>
                      {' '}neste produto. Aguarde a resposta do vendedor.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Bid form */}
              {product.status === 'active' && !userPendingBid && !userAcceptedBid && (
                <BidForm
                  productId={product.id}
                  minPrice={product.min_price}
                  sellerId={product.seller_id}
                  isAuthenticated={!!user}
                  userId={user?.id}
                  acceptsCash={product.accepts_cash}
                  acceptsTrade={product.accepts_trade}
                />
              )}
            </div>
          </div>
          
          {/* Owner's view of bids */}
          {isOwner && bids.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Lances Recebidos ({bids.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} productId={product.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

function BidCard({ bid, productId }: { bid: Bid; productId: string }) {
  return (
    <Card className={bid.status === 'accepted' ? 'border-success' : undefined}>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="font-semibold text-foreground">{bid.bidder?.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(bid.created_at)}
            </p>
          </div>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(bid.amount)}
          </p>
        </div>
        
        {bid.message && (
          <p className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {bid.message}
          </p>
        )}
        
        {bid.status === 'pending' && (
          <BidActions bidId={bid.id} productId={productId} />
        )}
        
        {bid.status === 'accepted' && (
          <div className="space-y-2">
            <Badge className="bg-success text-success-foreground">Aceito</Badge>
            {bid.bidder?.phone && (
              <p className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                {bid.bidder.phone}
              </p>
            )}
          </div>
        )}
        
        {bid.status === 'rejected' && (
          <Badge variant="destructive">Rejeitado</Badge>
        )}
      </CardContent>
    </Card>
  )
}
