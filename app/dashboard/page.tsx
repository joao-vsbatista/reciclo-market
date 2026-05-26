import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Gavel, TrendingUp, Plus, User } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  
  // Get user's products
  const { data: products } = await supabase
    .from('products')
    .select('id, status')
    .eq('seller_id', userId)
  
  // Get bids on user's products
  const { count: receivedBidsCount } = await supabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .in('product_id', products?.map(p => p.id) || [])
    .eq('status', 'pending')
  
  // Get user's bids on other products
  const { data: userBids } = await supabase
    .from('bids')
    .select('id, status, amount')
    .eq('bidder_id', userId)
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  const activeProducts = products?.filter(p => p.status === 'active').length || 0
  const soldProducts = products?.filter(p => p.status === 'sold').length || 0
  const pendingBids = userBids?.filter(b => b.status === 'pending').length || 0
  const acceptedBids = userBids?.filter(b => b.status === 'accepted').length || 0
  
  return {
    name: profile?.name || 'Usuário',
    activeProducts,
    soldProducts,
    totalProducts: products?.length || 0,
    receivedBids: receivedBidsCount || 0,
    pendingBids,
    acceptedBids,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const stats = await getDashboardStats(user.id)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
  <h1 className="text-2xl font-bold text-foreground">
    {new Date().getHours() < 12
      ? ' Bom dia'
      : new Date().getHours() < 18
      ? ' Boa tarde'
      : ' Boa noite'}, {stats.name}!
  </h1>
  <p className="text-muted-foreground">
    {stats.receivedBids > 0
      ? `Você tem ${stats.receivedBids} lance(s) esperando sua resposta.`
      : stats.pendingBids > 0
      ? `Você tem ${stats.pendingBids} lance(s) aguardando resposta do vendedor.`
      : stats.activeProducts > 0
      ? `Você tem ${stats.activeProducts} produto(s) ativo(s) no momento.`
      : 'Que tal criar seu primeiro anúncio hoje?'}
  </p>
</div>
        <Button asChild>
          <Link href="/produtos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Anúncio
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalProducts} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldProducts}</div>
            <p className="text-xs text-muted-foreground">
              produtos vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lances Recebidos</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receivedBids}</div>
            <p className="text-xs text-muted-foreground">
              aguardando resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meus Lances</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBids}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedBids} aceitos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>O que você gostaria de fazer?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/produtos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Criar novo anúncio
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/produtos">
                <Package className="mr-2 h-4 w-4" />
                Gerenciar meus produtos
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/lances">
                <Gavel className="mr-2 h-4 w-4" />
                Ver meus lances
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/vendedor/${user.id}`}>
                <User className="mr-2 h-4 w-4" />
                Ver meu perfil público
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas</CardTitle>
            <CardDescription>Maximize suas vendas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Fotos de qualidade:</strong> Produtos com boas fotos recebem até 3x mais lances.
            </p>
            <p>
              <strong className="text-foreground">Descrição detalhada:</strong> Inclua informações sobre estado, tempo de uso e acessórios.
            </p>
            <p>
              <strong className="text-foreground">Preço competitivo:</strong> Pesquise preços similares antes de definir o mínimo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
