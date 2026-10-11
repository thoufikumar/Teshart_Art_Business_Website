import { type ImgHTMLAttributes } from 'react'
import { type ArtworkId, getArtworkAsset } from '../../domain/artworkRegistry'

export interface ArtworkImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  artworkId: ArtworkId
  alt?: string
}

export default function ArtworkImage({
  artworkId,
  alt,
  className = '',
  loading = 'lazy',
  ...rest
}: ArtworkImageProps) {
  const asset = getArtworkAsset(artworkId)
  return (
    <img
      src={asset.src}
      alt={alt ?? asset.alt}
      loading={loading}
      className={`object-cover ${className}`}
      {...rest}
    />
  )
}

