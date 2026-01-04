'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { GenesisInfoModal } from './GenesisInfoModal'

export function GenesisButton() {
  const [showGenesisModal, setShowGenesisModal] = useState(false)

  return (
    <>
      <GenesisInfoModal isOpen={showGenesisModal} onClose={() => setShowGenesisModal(false)} />
      <button
        onClick={() => setShowGenesisModal(true)}
        className="cockpit-lever w-full inline-flex items-center justify-center text-sm py-3"
      >
        <span className="mr-2">🔗</span>
        Check out our Syntheverse Genesis on Base Mainnet
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </>
  )
}

