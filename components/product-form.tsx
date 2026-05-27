'use client'

import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { toast } from 'sonner'
import { Loader2, Gavel, Tag } from 'lucide-react'
//import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, BRAZILIAN_STATES } from '@/lib/types'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/types'
import type { ProductCondition } from '@/lib/types'
import { CitySearch } from '@/components/city-search'

interface ProductFormProps {
  userId: string
  userCity?: string
  userState?: string
}

export function ProductForm({ userId, userCity, userState }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([])
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState<ProductCondition | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [city, setCity] = useState(userCity || '')
  const [state, setState] = useState(userState || '')
  const [acceptsCash, setAcceptsCash] = useState(true)
  const [acceptsTrade, setAcceptsTrade] = useState(false)
  const [type, setType] = useState<'auction' | 'sale'>('auction')
  const [duration, setDuration] = useState('7')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !condition) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setIsLoading(true)

    if (!acceptsCash && !acceptsTrade) {
      toast.error('Selecione pelo menos uma forma de lance aceita')
      return
    }

    try {
      const supabase = createClient()
      
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: userId,
          title,
          description,
          category,
          condition,
          min_price: parseFloat(minPrice),
          city,
          state,
          accepts_cash: acceptsCash,
          accepts_trade: acceptsTrade,
          type,
          ends_at: type === 'auction' ? new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString() : null,
        })
        .select()
        .single()

      if (productError) throw productError

      // Add images
      const imageInserts = images.map((img) => ({
        product_id: product.id,
        url: img.url,
        is_primary: img.isPrimary,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts)

      if (imagesError) throw imagesError

      toast.success('Produto publicado com sucesso!')
      router.push(`/produtos/${product.id}`)
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Erro ao publicar produto. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imagens do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onChange={setImages}
            userId={userId}
            maxImages={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título do anúncio *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: iPhone 12 Pro Max 128GB"
              required
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto em detalhes: estado de conservação, tempo de uso, acessórios inclusos..."
              required
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Condição *</Label>
              <Select 
                value={condition} 
                onValueChange={(v) => setCondition(v as ProductCondition)} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minPrice">Preço mínimo (R$) *</Label>
            <Input
              id="minPrice"
              type="number"
              step="0.01"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0,00"
              required
            />
            <p className="text-sm text-muted-foreground">
              Você receberá lances a partir deste valor
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Tipo de Anúncio</CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => setType('auction')}
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
        type === 'auction'
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <Gavel className="h-6 w-6 text-primary" />
      <p className="font-medium text-sm">Leilão</p>
      <p className="text-xs text-muted-foreground text-center">Receba lances e escolha a melhor oferta</p>
    </button>
    <button
      type="button"
      onClick={() => setType('sale')}
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
        type === 'sale'
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <Tag className="h-6 w-6 text-primary" />
      <p className="font-medium text-sm">Venda Direta</p>
      <p className="text-xs text-muted-foreground text-center">Preço fixo, compra pelo carrinho</p>
    </button>
  </CardContent>
</Card>
    {type === 'auction' && (
      <Card>
  <CardHeader>
    <CardTitle>Formas de Lance Aceitas</CardTitle>
  </CardHeader>
  <Card>
  <CardHeader>
    <CardTitle>Duração do Leilão</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-4 gap-2">
      {['1', '3', '7', '14'].map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => setDuration(days)}
          className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
            duration === days
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <span className="text-xl font-bold text-foreground">{days}</span>
          <span className="text-xs text-muted-foreground">dias</span>
        </button>
      ))}
    </div>
    <p className="mt-3 text-xs text-muted-foreground">
      O leilão será encerrado automaticamente após o período selecionado.
    </p>
  </CardContent>
</Card>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="font-medium text-sm">💰 Dinheiro</p>
        <p className="text-xs text-muted-foreground">Aceitar lances em dinheiro</p>
      </div>
      <Switch
        checked={acceptsCash}
        onCheckedChange={setAcceptsCash}
      />
    </div>
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="font-medium text-sm">📦 Troca por produto</p>
        <p className="text-xs text-muted-foreground">Aceitar lances com produtos do inventário</p>
      </div>
      <Switch
        checked={acceptsTrade}
        onCheckedChange={setAcceptsTrade}
      />
    </div>
  </CardContent>
</Card>
    )}

      <Card>
  <CardHeader>
    <CardTitle>Localização</CardTitle>
  </CardHeader>
  <CardContent>
    <CitySearch
      city={city}
      state={state}
      onCityChange={setCity}
      onStateChange={setState}
    />
  </CardContent>
</Card>

      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            'Publicar Anúncio'
          )}
        </Button>
      </div>
    </form>
  )
}
