'use client'

import Image from 'next/image'

interface HeroSliderProps {
  images: string[]
  /** Controlled by parent — which slide is active */
  currentIndex: number
}

/**
 * Pure visual component. Parent manages timing and navigation.
 * Each image crossfades + applies Ken Burns zoom on the active slide.
 */
export default function HeroSlider({ images, currentIndex }: HeroSliderProps) {
  // Filter out empty/falsy URLs defensively before passing to next/image
  const validImages = images.filter((s) => s && s.trim() !== '')
  if (!validImages.length) return null

  return (
    // overflow:hidden clips the Ken Burns scale overflow
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {validImages.map((src, i) => {
        const isActive = i === currentIndex
        return (
          <div
            key={i}
            style={{
              position:   'absolute',
              inset:      0,
              opacity:    isActive ? 1 : 0,
              transition: 'opacity 1.2s ease',
              willChange: 'opacity',
            }}
          >
            <Image
              src={src}
              alt={i === 0 ? 'Container fabrication project in Nairobi Kenya' : ''}
              fill
              style={{
                objectFit:        'cover',
                objectPosition:   'center',
                // Ken Burns: scale restarts when animationName switches none→keyframe
                animationName:     isActive ? 'kenBurns' : 'none',
                animationDuration: '8s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                transformOrigin:   'center center',
              }}
              priority={i === 0}
              unoptimized
              sizes="100vw"
            />
          </div>
        )
      })}
    </div>
  )
}
