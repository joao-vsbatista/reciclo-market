'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, Loader2, Star, ShieldCheck, ShieldX } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: { url: string; isPrimary: boolean }[]
  onChange: (images: { url: string; isPrimary: boolean }[]) => void
  userId: string
  maxImages?: number
}

async function moderateImage(file: File): Promise<{ approved: boolean; reason?: string }> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: file.type, data: base64 }
            },
            {
              type: 'text',
              text: `Você é um moderador de conteúdo para um marketplace de produtos usados chamado ReCicloMarket.
              
Analise esta imagem e responda APENAS com um JSON no seguinte formato:
{"approved": true/false, "reason": "motivo se reprovado"}

Aprove imagens que mostram:
- Produtos para venda (roupas, eletrônicos, móveis, veículos, ferramentas, etc.)
- Ambientes neutros ou fundos simples
- Pessoas usando ou demonstrando produtos

Reprove imagens que contêm:
- Conteúdo sexual ou nudez
- Violência ou gore
- Armas ou drogas ilegais
- Conteúdo ofensivo ou discriminatório
- Imagens completamente fora de contexto (sem nenhum produto)

Responda APENAS com o JSON, sem texto adicional.`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())
    return result
  } catch (error) {
    console.error('Moderation error:', error)
    // Em caso de erro na moderação, aprova por padrão
    return { approved: true }
  }
}

export function ImageUpload({ images, onChange, userId, maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [moderating, setModerating] = useState(false)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`Você pode enviar no máximo ${maxImages} imagens`)
      return
    }

    setIsUploading(true)
    const supabase = createClient()
    const newImages: { url: string; isPrimary: boolean }[] = []

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error('Apenas imagens são permitidas')
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error('Imagem muito grande (máx. 5MB)')
          continue
        }

        // Moderação com IA
        setModerating(true)
        toast.loading('Verificando imagem...', { id: 'moderation' })

        const moderation = await moderateImage(file)
        setModerating(false)
        toast.dismiss('moderation')

        if (!moderation.approved) {
          toast.error(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldX className="h-4 w-4 text-destructive" />
                Imagem reprovada
              </div>
              <p className="text-xs text-muted-foreground">
                {moderation.reason || 'Esta imagem não é adequada para o marketplace.'}
              </p>
            </div>,
            { duration: 5000 }
          )
          continue
        }

        toast.success(
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Imagem aprovada
          </div>,
          { duration: 2000 }
        )

        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)

        if (uploadError) {
          toast.error('Erro ao enviar imagem')
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        newImages.push({
          url: publicUrl,
          isPrimary: images.length === 0 && newImages.length === 0
        })
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages])
        toast.success(`${newImages.length} imagem(ns) enviada(s)`)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Erro ao enviar imagens')
    } finally {
      setIsUploading(false)
      setModerating(false)
      e.target.value = ''
    }
  }, [images, onChange, userId, maxImages])

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    onChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({ ...img, isPrimary: i === index }))
    onChange(newImages)
  }

  const isLoading = isUploading || moderating

  return (
    <div className="space-y-4">
      {moderating && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Verificando imagem com IA...</p>
            <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.url}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg border-2',
              image.isPrimary ? 'border-primary' : 'border-border'
            )}
          >
            <Image src={image.url} alt={`Imagem ${index + 1}`} fill className="object-cover" sizes="150px" />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <div className="flex h-full items-center justify-center gap-2">
                <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleSetPrimary(index)}>
                  <Star className={cn('h-4 w-4', image.isPrimary && 'fill-primary text-primary')} />
                </Button>
                <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {image.isPrimary && (
              <div className="absolute bottom-0 left-0 right-0 bg-primary px-2 py-1 text-center text-xs text-primary-foreground">
                Principal
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className={cn(
            'flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted',
            isLoading && 'pointer-events-none opacity-50'
          )}>
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={isLoading} className="hidden" />
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">Adicionar</span>
              </>
            )}
          </label>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length}/{maxImages} imagens. Clique na estrela para definir a imagem principal.
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Moderação automática por IA
        </div>
      </div>
    </div>
  )
}