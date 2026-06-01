import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Gavel, Shield, MapPin, Tag, ShoppingCart, Package, Star, MessageSquare, Archive } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { PRODUCT_CONDITIONS } from '@/lib/types'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { StatsCounter } from '@/components/stats-counter'

async function getRecentAuctions(): Promise<Product[]> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select(`*, seller:profiles!products_seller_id_fkey(id, name, city, state), images:product_images(id, url, is_primary)`)
    .eq('status', 'active').eq('type', 'auction')
    .order('created_at', { ascending: false }).limit(4)
  if (!products) return []
  const productsWithBids = await Promise.all(products.map(async (product) => {
    const { count } = await supabase.from('bids').select('*', { count: 'exact', head: true }).eq('product_id', product.id).eq('status', 'pending')
    return { ...product, bids_count: count || 0 }
  }))
  return productsWithBids
}

async function getRecentSales() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`*, type, seller:profiles!products_seller_id_fkey(id, name, city, state), images:product_images(id, url, is_primary)`)
    .eq('status', 'active').eq('type', 'sale')
    .order('created_at', { ascending: false }).limit(4)
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  const [{ count: products }, { count: users }, { count: deals }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
  ])
  return { products: products || 0, users: users || 0, deals: deals || 0 }
}

export default async function HomePage() {
  const [auctions, sales, stats] = await Promise.all([getRecentAuctions(), getRecentSales(), getStats()])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Background grid */}
          <div className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--color-border) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(142_70%_38%/0.08),transparent)]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5 text-sm animate-fade-in">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Marketplace de produtos usados
              </Badge>

              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance leading-tight">
                Compre, venda e{' '}
                <span className="relative">
                  <span className="text-primary">negocie</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                </span>
              </h1>

              <p className="mt-6 text-xl leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
                O marketplace completo — produtos com preço fixo para compra imediata
                ou leilões onde você negocia o melhor valor.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  <Link href="/leiloes">
                    <Gavel className="mr-2 h-5 w-5" />
                    Ver Leilões
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base hover:bg-primary/5 hover:border-primary/50 transition-all">
                  <Link href="/vendas">
                    <Tag className="mr-2 h-5 w-5" />
                    Ver Vendas
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <StatsCounter products={stats.products} users={stats.users} deals={stats.deals} />

        {/* Features */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(142_70%_38%/0.05),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Tudo que você precisa</h2>
              <p className="mt-4 text-muted-foreground text-lg">Uma plataforma completa para suas negociações</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Gavel, title: 'Sistema de Lances', desc: 'Faça ofertas e negocie diretamente com vendedores', color: 'text-primary' },
                { icon: ShoppingCart, title: 'Compra Imediata', desc: 'Produtos com preço fixo para compra direta pelo carrinho', color: 'text-primary' },
                { icon: Shield, title: 'Negociação Segura', desc: 'Contato liberado apenas após aceite do lance', color: 'text-primary' },
                { icon: MapPin, title: 'Perto de Você', desc: 'Encontre produtos na sua cidade ou região', color: 'text-primary' },
              ].map((feature) => (
                <div key={feature.title} className="group relative rounded-2xl border border-border bg-background p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leilões recentes */}
        <section className="py-20 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-1 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">Leilões</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground">Leilões Recentes</h2>
                <p className="mt-2 text-muted-foreground">Dê lances e negocie o melhor preço</p>
              </div>
              <Button asChild variant="ghost" className="gap-2 hover:gap-3 transition-all">
                <Link href="/leiloes">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {auctions.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {auctions.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <Gavel className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum leilão disponível no momento.</p>
                <Button asChild variant="outline">
                  <Link href="/produtos/novo">Criar leilão</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Vendas recentes */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-1 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">Vendas</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground">Produtos à Venda</h2>
                <p className="mt-2 text-muted-foreground">Preço fixo, compra imediata pelo carrinho</p>
              </div>
              <Button asChild variant="ghost" className="gap-2 hover:gap-3 transition-all">
                <Link href="/vendas">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {sales.length > 0 ? (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {sales.map((product: any) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <Tag className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum produto à venda no momento.</p>
                <Button asChild variant="outline"><Link href="/produtos/novo">Anunciar produto</Link></Button>
              </div>
            )}
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-24 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Como funciona</h2>
              <p className="mt-4 text-muted-foreground text-lg">Simples, rápido e seguro</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta gratuitamente em menos de 1 minuto', icon: '👤' },
                { step: '02', title: 'Anuncie ou explore', desc: 'Publique seus produtos ou encontre o que procura nos leilões e vendas', icon: '🔍' },
                { step: '03', title: 'Negocie e feche', desc: 'Dê lances, receba propostas e conclua negócios com segurança', icon: '🤝' },
              ].map((item, i) => (
                <div key={item.step} className="relative flex flex-col items-center text-center p-8">
                  {i < 2 && (
                    <div className="absolute top-12 right-0 hidden sm:block w-1/2 h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <div className="mb-3 text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{item.step}</div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden border-t border-border">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(142_70%_38%/0.08),transparent)]" />
          <div className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--color-border) / 0.2) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border) / 0.2) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl text-balance">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Cadastre-se gratuitamente e comece a negociar hoje mesmo.
              Escolha entre venda direta ou leilão.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                <Link href="/auth/sign-up">
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/leiloes">Explorar produtos</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}