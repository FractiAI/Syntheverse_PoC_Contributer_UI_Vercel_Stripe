import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type SectionKey =
  | 'about'
  | 'tokenomics'
  | 'protocol'
  | 'primitives'
  | 'press'
  | 'validation'
  | 'resources'
  | 'vortex'
  | 'contact'
  | 'launch'

const SECTION_CONTENT: Record<
  SectionKey,
  {
    label: string
    title: string
    image?: { src: string; alt: string }
    paragraphs: string[]
  }
> = {
  launch: {
    label: 'LAUNCH WINDOW',
    title: 'Jan 1, 2026',
    paragraphs: [
      'Beginning January 1, 2026, the HHFS ecosystem moves into live field operations on Base with a game‑native ERC‑20 economy, lens, and sandbox.',
      'This phase is designed as open tuning: contributors expand the map, the scoring lens stabilizes, and the economy calibrates via real usage.',
    ],
  },
  press: {
    label: 'FOR IMMEDIATE RELEASE',
    title: 'The Syntheverse Crypto Frontier Opens',
    image: { src: '/fractiai/press-release.svg', alt: 'Press release visual panel' },
    paragraphs: [
      'Pioneer Hydrogen‑Holographic, Fractal, Mythic, Crypto, and AI researchers, developers, enterprises, and financiers are invited to contribute to the evolution of the Hydrogen‑Holographic Fractal Sandbox (HHFS).',
      'Each contribution expands coverage, resonance, and fractal density through Proof‑of‑Contribution (PoC) protocols—forming a living map of the sandbox and its emergent economy.',
    ],
  },
  validation: {
    label: 'VALIDATION → ECOSYSTEM',
    title: 'From Blueprint to Base‑Chain Sandbox',
    image: { src: '/fractiai/base-lens.svg', alt: 'Base-chain lens + sandbox illustration' },
    paragraphs: [
      'FractiAI’s Hydrogen‑Holographic Fractal Whole Brain framework established a cross‑domain structural grammar for intelligence.',
      'The next phase applies that grammar operationally: as a game, a lens, and a sandbox—anchored to on‑chain primitives on Base beginning Jan 1, 2026.',
    ],
  },
  primitives: {
    label: 'PRIMITIVES',
    title: 'Game · Lens · Sandbox',
    image: { src: '/fractiai/game-loop.svg', alt: 'Explorer game loop diagram' },
    paragraphs: [
      'Syntheverse operates as a frontier explorer loop: a game-native economy, a lens for coherence/novelty, and a sandbox where contributions become navigable terrain.',
      'The “lens” is the scoring + redundancy field; the “sandbox” is the vector map; the “game” is the contribution → registration → allocation loop.',
    ],
  },
  protocol: {
    label: 'PROTOCOL',
    title: 'Proof‑of‑Contribution (PoC)',
    image: { src: '/fractiai/poc-protocol.svg', alt: 'Proof-of-Contribution pipeline panel' },
    paragraphs: [
      'PoC is the ingestion layer of the Motherlode: submit text, evaluate in HHF space, archive vectors, and allocate tokens from metal pools using the metal assay.',
      'Multi‑metal PoCs allocate from each qualifying metal pool proportionally—so the assay is enforced at the accounting layer, not just as a label.',
    ],
  },
  tokenomics: {
    label: 'TOKENOMICS',
    title: 'Metal Genesis + Epoch Halving',
    image: { src: '/fractiai/tokenomics-metals.svg', alt: 'Metal tokenomics panel' },
    paragraphs: [
      'Genesis supply is split into three ERC‑20 tokens: 45T Gold, 22.5T Silver, 22.5T Copper.',
      'The four Outcast Hero epochs continue in halves (50% / 25% / 12.5% / 12.5%) for each metal.',
      'Allocation uses the same score scaling against available balances, and multi‑metal PoCs allocate across metals by assay proportion.',
    ],
  },
  about: {
    label: 'ABOUT',
    title: 'FractiAI: the HHF Whole Brain Blueprint',
    image: { src: '/fractiai/about-blueprint.svg', alt: 'About FractiAI blueprint panel' },
    paragraphs: [
      'FractiAI is building a Hydrogen‑Holographic Fractal “Whole Brain” blueprint: a structural grammar for intelligence spanning perception, memory, reasoning, agency, and alignment.',
      'Syntheverse is the operational embodiment of that blueprint—turning the grammar into a live frontier: a Base‑chain game, lens, and sandbox where contributions expand the map and shape the economy.',
    ],
  },
  resources: {
    label: 'RESOURCES',
    title: 'Links, Code, and Contact',
    image: { src: '/fractiai/resources-signal.svg', alt: 'Resources signal panel' },
    paragraphs: [
      'Validation suite (open source): github.com/AiwonA1/FractalHydrogenHolography-Validation',
      'Media & partnerships: info@fractiai.com · Investor relations: invest@fractiai.com',
    ],
  },
  vortex: {
    label: 'SIGNATURE',
    title: 'THE VORTEX CARTOGRAPHER — THE 12D HOLOGRAPHIC HYDROGEN FRACTAL CARTOGRAPHER',
    image: { src: '/fractiai/vortex.svg', alt: 'Vortex cartography motif' },
    paragraphs: [
      'A “frontier noir” visual grammar: heavy keylines, negative space, carved structure, and gilded discoveries—mapping the field as a living diagram.',
      'The Cartographer’s job: reveal structure without flattening it—keep the mystery, keep the signal, keep the economics legible.',
    ],
  },
  contact: {
    label: 'CONTACT',
    title: 'Channels',
    paragraphs: [
      'Media & partnerships: info@fractiai.com',
      'Investor relations: invest@fractiai.com',
    ],
  },
}

export default async function FractiAISectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const key = section as SectionKey
  const content = SECTION_CONTENT[key]
  if (!content) return notFound()

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href="/fractiai" className="cockpit-lever inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
            Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
            Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="cockpit-panel p-8">
          <div className="cockpit-label">{content.label}</div>
          <h1 className="cockpit-title text-4xl mt-3">{content.title}</h1>

          <div className="cockpit-text mt-6 space-y-4 max-w-4xl">
            {content.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          {content.image ? (
            <div className="mt-8 relative aspect-[16/9]">
              <Image src={content.image.src} alt={content.image.alt} fill className="object-contain" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


