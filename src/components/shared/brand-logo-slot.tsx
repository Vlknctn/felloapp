"use client"

import * as React from "react"

type Props = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  loading?: React.ImgHTMLAttributes<HTMLImageElement>["loading"]
}

/** Logo fills the parent box, centered, aspect ratio preserved. Parent must have explicit size. */
export function BrandLogoSlot({ src, alt, className = "", imgClassName = "", loading = "lazy" }: Props) {
  return (
    <span className={`brand-logo-slot ${className}`.trim()}>
      <img src={src} alt={alt} className={`brand-logo-slot__img ${imgClassName}`.trim()} loading={loading} />
    </span>
  )
}
