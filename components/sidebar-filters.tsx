'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, BRAZILIAN_STATES } from '@/lib/types'

const ALL_VALUE = 'all'

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  )
}

export function SidebarFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('categoria') || ALL_VALUE)
  const [condition, setCondition] = useState(searchParams.get('condicao') || ALL_VALUE)
  const [state, setState] = useState(searchParams.get('estado') || ALL_VALUE)
  const [minPrice, setMinPrice] = useState(searchParams.get('preco_min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('preco_max') || '')

  const createQueryString = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== ALL_VALUE) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    return newParams.toString()
  }, [searchParams])

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const query = createQueryString({
      q: search,
      categoria: category,
      condicao: condition,
      estado: state,
      preco_min: minPrice,
      preco_max: maxPrice,
      ...overrides,
    })
    router.push(`?${query}`)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory(ALL_VALUE)
    setCondition(ALL_VALUE)
    setState(ALL_VALUE)
    setMinPrice('')
    setMaxPrice('')
    router.push('?')
  }

  const hasActiveFilters =
    (category && category !== ALL_VALUE) ||
    (condition && condition !== ALL_VALUE) ||
    (state && state !== ALL_VALUE) ||
    minPrice || maxPrice || search

  const handleCategory = (value: string) => {
    setCategory(value)
    applyFilters({ categoria: value })
  }

  const handleCondition = (value: string) => {
    setCondition(value)
    applyFilters({ condicao: value })
  }

  const handleState = (value: string) => {
    setState(value)
    applyFilters({ estado: value })
  }

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="rounded-xl border border-border p-4 space-y-4 sticky top-24">

        {/* Busca */}
        <div>
          <form
            onSubmit={(e) => { e.preventDefault(); applyFilters() }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Button type="submit" size="sm" className="h-9">Ir</Button>
          </form>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-destructive hover:underline">
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}
        </div>

        <Separator />

        {/* Categorias */}
        <FilterSection title="Categoria">
          <button
            onClick={() => handleCategory(ALL_VALUE)}
            className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
              category === ALL_VALUE ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            Todas
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                category === cat ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </FilterSection>

        <Separator />

        {/* Condição */}
        <FilterSection title="Condição">
          <button
            onClick={() => handleCondition(ALL_VALUE)}
            className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
              condition === ALL_VALUE ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            Qualquer
          </button>
          {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleCondition(key)}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                condition === key ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </FilterSection>

        <Separator />

        {/* Estado */}
        <FilterSection title="Estado" defaultOpen={false}>
          <button
            onClick={() => handleState(ALL_VALUE)}
            className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
              state === ALL_VALUE ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            Todos
          </button>
          {BRAZILIAN_STATES.map((uf) => (
            <button
              key={uf}
              onClick={() => handleState(uf)}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                state === uf ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {uf}
            </button>
          ))}
        </FilterSection>

        <Separator />

        {/* Faixa de preço */}
        <FilterSection title="Faixa de preço">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Button onClick={() => applyFilters()} size="sm" className="w-full mt-2">
            Aplicar
          </Button>
        </FilterSection>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Filtros ativos:</p>
              <div className="flex flex-wrap gap-1.5">
                {search && <Badge variant="secondary" className="text-xs gap-1">{search} <button onClick={() => { setSearch(''); applyFilters({ q: '' }) }}><X className="h-3 w-3" /></button></Badge>}
                {category !== ALL_VALUE && <Badge variant="secondary" className="text-xs gap-1">{category} <button onClick={() => handleCategory(ALL_VALUE)}><X className="h-3 w-3" /></button></Badge>}
                {condition !== ALL_VALUE && <Badge variant="secondary" className="text-xs gap-1">{PRODUCT_CONDITIONS[condition as keyof typeof PRODUCT_CONDITIONS]} <button onClick={() => handleCondition(ALL_VALUE)}><X className="h-3 w-3" /></button></Badge>}
                {state !== ALL_VALUE && <Badge variant="secondary" className="text-xs gap-1">{state} <button onClick={() => handleState(ALL_VALUE)}><X className="h-3 w-3" /></button></Badge>}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}