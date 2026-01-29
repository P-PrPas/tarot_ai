import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntentionScreen from './components/IntentionScreen'
import CardSelectionScreen from './components/CardSelectionScreen'
import AnalysisScreen from './components/AnalysisScreen'

type Step = 'intention' | 'select' | 'analysis'

function App() {
  const [step, setStep] = useState<Step>('intention')
  const [intention, setIntention] = useState('')
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const handleIntentionSubmit = (text: string) => {
    setIntention(text)
    setStep('select')
  }

  const handleCardsSelected = (ids: string[]) => {
    setSelectedCards(ids)
    setStep('analysis')
  }

  const handleReset = () => {
    setIntention('')
    setSelectedCards([])
    setStep('intention')
  }

  return (
    <Box minH="100vh" bg="mystic.900" overflowX="hidden">
      <AnimatePresence mode="wait">
        {step === 'intention' && (
          <motion.div
            key="intention"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IntentionScreen onComplete={handleIntentionSubmit} />
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardSelectionScreen onComplete={handleCardsSelected} />
          </motion.div>
        )}

        {step === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnalysisScreen
              cardIds={selectedCards}
              intention={intention}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default App
