'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  is_primary: boolean
}

interface ProductGalleryZoomProps {
  images: ProductImage[]
  title: string
}

export function ProductGalleryZoom({ images, title }: ProductGalleryZoomProps) {
  const [selectedImage, setSelectedImage] = useState(
    images.find((img) => img.is_primary) || images[0]
  )
  const [zoom, setZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  return (
    <div className="flex gap-4">
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-20 shrink-0">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                selectedImage?.id === img.id
                  ? 'border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Image
                src={img.url}
                alt={title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Imagem principal com zoom */}
      <div className="flex-1">
        <div
          ref={imageRef}
          className="relative aspect-square overflow-hidden rounded-xl bg-muted cursor-crosshair"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
        >
          {selectedImage ? (
            <Image
              src={selectedImage.url}
              alt={title}
              fill
              className="object-cover transition-transform duration-100"
              style={
                zoom
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: 'scale(2.5)',
                    }
                  : {}
              }
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {zoom && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
              🔍 Zoom
            </div>
          )}
        </div>
      </div>
    </div>
  )
}