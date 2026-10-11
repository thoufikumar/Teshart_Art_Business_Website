// Raw original artwork assets (preferred for unframed/sketch representations)
import rawCoupleFramedWall from '../assets/Artworks/Raw images of artworks/001.png'
import rawCoupleCloseUp from '../assets/Artworks/Raw images of artworks/002.jpg'
import rawMaleSketch from '../assets/Artworks/Raw images of artworks/003.jpg'
import rawWomanSketchpad from '../assets/Artworks/Raw images of artworks/004.jpg'
import rawTriptychBeard from '../assets/Artworks/Raw images of artworks/005.jpg'
import rawGirlCharcoal from '../assets/Artworks/Raw images of artworks/006.jpg'
import rawChildSketch from '../assets/Artworks/Raw images of artworks/007.jpg'
import rawWomanClipboard from '../assets/Artworks/Raw images of artworks/008.jpg'
import rawLaughingCoupleGrid from '../assets/Artworks/Raw images of artworks/009.jpg'
import rawFamilySketch from '../assets/Artworks/Raw images of artworks/010.jpg'
import rawWipWoman from '../assets/Artworks/Raw images of artworks/011-1.jpg'
import rawWipMusician from '../assets/Artworks/Raw images of artworks/011-2.jpg'

// Framed artwork mockups (for framed presentation & hero/carousel showcases)
import framedChild from '../assets/Artworks/Framed artwork mockups/001.png'
import framedGirlCrown from '../assets/Artworks/Framed artwork mockups/002.png'
import framedFamily from '../assets/Artworks/Framed artwork mockups/003.png'
import framedCouple from '../assets/Artworks/Framed artwork mockups/couple.png'
import framedWoman from '../assets/Artworks/Framed artwork mockups/woman.png'

// Softened artwork variants (only where needed as supplementary clean previews)
import softenedMale from '../assets/Artworks/Softened artworks/001.jpeg'
import softenedTriptych from '../assets/Artworks/Softened artworks/002.jpeg'
import softenedLaughingCouple from '../assets/Artworks/Softened artworks/003.jpeg'
import softenedTwoWomen from '../assets/Artworks/Softened artworks/004.jpeg'
import softenedCoupleCloseUp from '../assets/Artworks/Softened artworks/005.jpeg'
import softenedWoman from '../assets/Artworks/Softened artworks/006.jpeg'
import softenedChild from '../assets/Artworks/Softened artworks/007.jpeg'
import softenedFamily from '../assets/Artworks/Softened artworks/008.jpeg'

export type ArtworkId =
  | 'raw-couple-wall'
  | 'raw-couple-closeup'
  | 'raw-male-sketch'
  | 'raw-woman-sketchpad'
  | 'raw-triptych-beard'
  | 'raw-girl-charcoal'
  | 'raw-child-sketch'
  | 'raw-woman-clipboard'
  | 'raw-laughing-couple-grid'
  | 'raw-family-sketch'
  | 'raw-wip-woman'
  | 'raw-wip-musician'
  | 'framed-child'
  | 'framed-girl-crown'
  | 'framed-family'
  | 'framed-couple'
  | 'framed-woman'
  | 'softened-male'
  | 'softened-triptych'
  | 'softened-laughing-couple'
  | 'softened-two-women'
  | 'softened-couple-closeup'
  | 'softened-woman'
  | 'softened-child'
  | 'softened-family'

export type ArtworkVariantType = 'raw' | 'framed' | 'softened'

export interface ArtworkAsset {
  id: ArtworkId
  src: string
  alt: string
  variant: ArtworkVariantType
  category: 'single' | 'duo' | 'family'
  aspectRatio: string
}

export const ARTWORK_REGISTRY: Record<ArtworkId, ArtworkAsset> = {
  'raw-couple-wall': {
    id: 'raw-couple-wall',
    src: rawCoupleFramedWall,
    alt: 'Hand-drawn pencil portrait of a couple in a black frame',
    variant: 'raw',
    category: 'duo',
    aspectRatio: '16/9',
  },
  'raw-couple-closeup': {
    id: 'raw-couple-closeup',
    src: rawCoupleCloseUp,
    alt: 'Detailed hand-drawn pencil portrait of a couple',
    variant: 'raw',
    category: 'duo',
    aspectRatio: '3/4',
  },
  'raw-male-sketch': {
    id: 'raw-male-sketch',
    src: rawMaleSketch,
    alt: 'Hand-drawn single pencil portrait on sketch paper',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-woman-sketchpad': {
    id: 'raw-woman-sketchpad',
    src: rawWomanSketchpad,
    alt: 'Hand-drawn single portrait of a smiling woman on a spiral sketchpad',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-triptych-beard': {
    id: 'raw-triptych-beard',
    src: rawTriptychBeard,
    alt: 'Detailed charcoal and graphite portrait study',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-girl-charcoal': {
    id: 'raw-girl-charcoal',
    src: rawGirlCharcoal,
    alt: 'Hand-drawn portrait of a young girl in a dress',
    variant: 'raw',
    category: 'single',
    aspectRatio: '4/3',
  },
  'raw-child-sketch': {
    id: 'raw-child-sketch',
    src: rawChildSketch,
    alt: 'Hand-drawn pencil portrait of a child resting chin on hands',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-woman-clipboard': {
    id: 'raw-woman-clipboard',
    src: rawWomanClipboard,
    alt: 'Original pencil portrait of a woman holding flowers on a drawing board',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-laughing-couple-grid': {
    id: 'raw-laughing-couple-grid',
    src: rawLaughingCoupleGrid,
    alt: 'Work-in-progress hand-drawn couple portrait showing artist grid lines',
    variant: 'raw',
    category: 'duo',
    aspectRatio: '3/4',
  },
  'raw-family-sketch': {
    id: 'raw-family-sketch',
    src: rawFamilySketch,
    alt: 'Hand-drawn family pencil portrait of parents and daughter',
    variant: 'raw',
    category: 'family',
    aspectRatio: '3/4',
  },
  'raw-wip-woman': {
    id: 'raw-wip-woman',
    src: rawWipWoman,
    alt: 'In-progress pencil sketch of a woman',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'raw-wip-musician': {
    id: 'raw-wip-musician',
    src: rawWipMusician,
    alt: 'In-progress pencil sketch of a musician with headphones',
    variant: 'raw',
    category: 'single',
    aspectRatio: '3/4',
  },
  'framed-child': {
    id: 'framed-child',
    src: framedChild,
    alt: 'Framed hand-drawn pencil portrait of a child',
    variant: 'framed',
    category: 'single',
    aspectRatio: '3/4',
  },
  'framed-girl-crown': {
    id: 'framed-girl-crown',
    src: framedGirlCrown,
    alt: 'Framed hand-drawn portrait of a young girl',
    variant: 'framed',
    category: 'single',
    aspectRatio: '3/4',
  },
  'framed-family': {
    id: 'framed-family',
    src: framedFamily,
    alt: 'Framed hand-drawn family portrait of three',
    variant: 'framed',
    category: 'family',
    aspectRatio: '3/4',
  },
  'framed-couple': {
    id: 'framed-couple',
    src: framedCouple,
    alt: 'Framed hand-drawn couple pencil portrait',
    variant: 'framed',
    category: 'duo',
    aspectRatio: '4/3',
  },
  'framed-woman': {
    id: 'framed-woman',
    src: framedWoman,
    alt: 'Framed hand-drawn portrait of a smiling woman',
    variant: 'framed',
    category: 'single',
    aspectRatio: '3/4',
  },
  'softened-male': {
    id: 'softened-male',
    src: softenedMale,
    alt: 'Pencil portrait of a man',
    variant: 'softened',
    category: 'single',
    aspectRatio: '3/4',
  },
  'softened-triptych': {
    id: 'softened-triptych',
    src: softenedTriptych,
    alt: 'Detailed charcoal portrait study',
    variant: 'softened',
    category: 'single',
    aspectRatio: '3/4',
  },
  'softened-laughing-couple': {
    id: 'softened-laughing-couple',
    src: softenedLaughingCouple,
    alt: 'Hand-drawn portrait of a laughing couple',
    variant: 'softened',
    category: 'duo',
    aspectRatio: '3/4',
  },
  'softened-two-women': {
    id: 'softened-two-women',
    src: softenedTwoWomen,
    alt: 'Hand-drawn duo portrait of two women',
    variant: 'softened',
    category: 'duo',
    aspectRatio: '3/4',
  },
  'softened-couple-closeup': {
    id: 'softened-couple-closeup',
    src: softenedCoupleCloseUp,
    alt: 'Hand-drawn close-up couple portrait',
    variant: 'softened',
    category: 'duo',
    aspectRatio: '3/4',
  },
  'softened-woman': {
    id: 'softened-woman',
    src: softenedWoman,
    alt: 'Hand-drawn single portrait of a woman',
    variant: 'softened',
    category: 'single',
    aspectRatio: '3/4',
  },
  'softened-child': {
    id: 'softened-child',
    src: softenedChild,
    alt: 'Hand-drawn pencil portrait of a child',
    variant: 'softened',
    category: 'single',
    aspectRatio: '3/4',
  },
  'softened-family': {
    id: 'softened-family',
    src: softenedFamily,
    alt: 'Hand-drawn family pencil portrait',
    variant: 'softened',
    category: 'family',
    aspectRatio: '3/4',
  },
}

export function getArtworkAsset(id: ArtworkId): ArtworkAsset {
  return ARTWORK_REGISTRY[id]
}

