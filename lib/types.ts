export type ProductCondition = 'novo' | 'seminovo' | 'usado' | 'para_pecas'
export type ProductStatus = 'active' | 'sold' | 'cancelled'
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface Profile {
  id: string
  name: string
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface Product {
  accepts_trade: boolean | undefined
  accepts_cash: boolean | undefined
  id: string
  seller_id: string
  title: string
  description: string
  category: string
  condition: ProductCondition
  min_price: number
  city: string
  state: string
  status: ProductStatus
  created_at: string
  updated_at: string
  ends_at?: string | null
  seller?: Profile
  images?: ProductImage[]
  bids_count?: number
  type?: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface Bid {
  id: string
  product_id: string
  bidder_id: string
  amount: number
  message: string | null
  status: BidStatus
  created_at: string
  updated_at: string
  bidder?: Profile
  product?: Product
}

export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Móveis',
  'Veículos',
  'Ferramentas',
  'Roupas',
  'Esportes',
  'Casa e Jardim',
  'Outros'
] as const

export const PRODUCT_CONDITIONS: Record<ProductCondition, string> = {
  novo: 'Novo',
  seminovo: 'Seminovo',
  usado: 'Usado',
  para_pecas: 'Para Peças'
}

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado'
}

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const
