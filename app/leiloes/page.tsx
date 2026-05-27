import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { SidebarFilters } from '@/components/sidebar-filters'
import { Gavel, Package } from 'lucide-react'
import type { Product, ProductCondition } from '@/lib/types'
import { Breadcrumb } from '@/components/breadcrumb'

interface LeiloesPageProps {
  searchParams: Promise<{
    q?: string
    categoria?: string
    condicao?: ProductCondition
    estado?: string
    preco_min?: string
    preco_max?: string
  }>
}

async function getAuctions(params: Awaited<LeiloesPageProps['searchParams']>): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles!products_seller_id_fkey(id, name, city, state),
      images:product_images(id, url, is_primary)
    `)
    .eq('status', 'active')
    .eq('type', 'auction')
    .order('created_at', { ascending: false })

  if (params.q) query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  if (params.categoria) query = query.eq('category', params.categoria)
  if (params.condicao) query = query.eq('condition', params.condicao)
  if (params.estado) query = query.eq('state', params.estado)
  if (params.preco_min) query = query.gte('min_price', parseFloat(params.preco_min))
  if (params.preco_max) query = query.lte('min_price', parseFloat(params.preco_max))

  const { data: products } = await query.limit(50)
  if (!products) return []

  const productsWithBids = await Promise.all(
    products.map(async (product) => {
      const { count } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id)
        .eq('status', 'pending')
      return { ...product, bids_count: count || 0 }
    })
  )

  return productsWithBids
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  )
}

async function AuctionsList({ params }: { params: Awaited<LeiloesPageProps['searchParams']> }) {
  const products = await getAuctions(params)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum leilão encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tente ajustar os filtros ou fazer uma nova busca</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default async function LeiloesPage({ searchParams }: LeiloesPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Leilões' }]} />

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gavel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leilões</h1>
              <p className="mt-1 text-muted-foreground">Dê lances e negocie o melhor preço</p>
            </div>
          </div>

          {/* Layout com filtro lateral */}
          <div className="flex gap-6 items-start">
            <SidebarFilters />
            <div className="flex-1 min-w-0">
              <Suspense fallback={<Loading />}>
                <AuctionsList params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}