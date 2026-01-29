import { Box, VStack, Heading, Text, Image, Button, SimpleGrid, Spinner } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const MotionBox = motion(Box)

interface CardData {
    name: string
    img: string
    position: string
}

interface AnalysisScreenProps {
    selectedIndices: number[]
    intention: string
    onReset: () => void
}

const AnalysisScreen = ({ selectedIndices, intention, onReset }: AnalysisScreenProps) => {
    const [loading, setLoading] = useState(true)
    const [cards, setCards] = useState<CardData[]>([])
    const [prediction, setPrediction] = useState<string>('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use env var for API URL or default to empty string (which implies same origin/proxy)
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${apiUrl}/api/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: intention,
                        selected_indices: selectedIndices
                    })
                })
                if (!res.ok) throw new Error("Failed to fetch")
                const data = await res.json()
                setCards(data.cards)
                setPrediction(data.prediction)
            } catch (err) {
                console.error(err)
                setPrediction("The mists are too thick. The Oracle could not see clearly. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [intention, selectedIndices])

    if (loading) {
        return (
            <VStack spacing={8} py={20} minH="100vh" justify="center">
                <Spinner size="xl" color="brand.400" thickness="4px" />
                <Text color="brand.200" fontSize="lg" animate={{ opacity: [0.5, 1, 0.5] }} as={motion.p} transition={{ repeat: Infinity, duration: 2 } as any}>
                    Consulting the Spirits...
                </Text>
            </VStack>
        )
    }

    // Helper to render bold text
    const renderStyledText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <Text key={index} as="span" fontWeight="bold" color="brand.200">{part.slice(2, -2)}</Text>
            }
            return <Text key={index} as="span">{part}</Text>
        })
    }

    const parsePrediction = (text: string) => {
        if (!text) return { intro: '', sections: [], summary: '' }

        // Normalize newlines
        const cleanText = text.replace(/\r\n/g, '\n')

        // 1. Split by horizontal rules (---)
        const mainParts = cleanText.split('\n---\n')

        let intro = mainParts[0] || ''
        let body = mainParts[1] || ''
        let summary = mainParts[2] || ''

        // If only 1 part (no ---), try to guess or dump all to intro
        if (mainParts.length === 1) {
            intro = text
            body = ''
            summary = ''
        }

        // 2. Parse Body (Card Interpretations)
        // Look for sections starting with ### or #### followed by number
        const cardSections: { title: string, content: string }[] = []
        if (body) {
            const lines = body.split('\n')
            let currentTitle = ''
            let currentContent: string[] = []

            lines.forEach(line => {
                if (line.match(/^#+\s/)) {
                    if (currentTitle) {
                        cardSections.push({ title: currentTitle, content: currentContent.join('\n').trim() })
                    }
                    currentTitle = line.replace(/^#+\s/, '').trim()
                    currentContent = []
                } else {
                    currentContent.push(line)
                }
            })
            if (currentTitle) {
                cardSections.push({ title: currentTitle, content: currentContent.join('\n').trim() })
            }
        }

        // 3. Clean up Summary
        // Remove headers from summary if present
        summary = summary.replace(/^#+\s.*$/m, '').trim()

        return { intro, sections: cardSections, summary }
    }

    const parsed = parsePrediction(prediction)

    return (
        <VStack spacing={12} py={10} minH="100vh" px={4} overflowX="hidden">
            <VStack spacing={2}>
                <Text color="gray.400" fontSize="sm" letterSpacing="widest">THE QUESTION</Text>
                <Heading size="md" color="white" textAlign="center" maxW="800px">
                    "{intention}"
                </Heading>
            </VStack>

            {/* Intro Section */}
            {parsed.intro && (
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    maxW="800px"
                    textAlign="center"
                    color="gray.300"
                    fontSize="lg"
                >
                    {renderStyledText(parsed.intro)}
                </MotionBox>
            )}

            {/* Cards Grid */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full" maxW="1000px" justifyItems="center">
                {cards.map((card, index) => (
                    <MotionBox
                        key={index}
                        initial={{ opacity: 0, y: 50, rotateY: 180 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        style={{ perspective: 1000 }}
                        w="full"
                    >
                        <VStack spacing={4}>
                            {/* Card Image */}
                            <Box
                                borderRadius="lg"
                                overflow="hidden"
                                boxShadow="0 0 30px rgba(214, 158, 46, 0.2)"
                                border="2px solid"
                                borderColor="brand.600"
                                _hover={{ borderColor: 'brand.400', transform: 'translateY(-10px)' }}
                                transition="all 0.3s"
                                position="relative"
                                maxW="200px"
                            >
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    bg="blackAlpha.700"
                                    w="full"
                                    p={1}
                                    textAlign="center"
                                >
                                    <Text fontSize="xs" color="brand.200">{card.position}</Text>
                                </Box>
                                <Image
                                    src={`/cards/${card.img}`}
                                    alt={card.name}
                                    objectFit="cover"
                                />
                            </Box>

                            {/* Card Name */}
                            <Text color="brand.200" fontSize="lg" fontWeight="bold">{card.name}</Text>

                            {/* Card Analysis (Matched by index if available) */}
                            {parsed.sections[index] && (
                                <Box
                                    bg="whiteAlpha.50"
                                    p={4}
                                    borderRadius="md"
                                    fontSize="sm"
                                    color="gray.300"
                                    w="full"
                                    borderLeft="2px solid"
                                    borderColor="brand.600"
                                >
                                    {renderStyledText(parsed.sections[index].content)}
                                </Box>
                            )}
                        </VStack>
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Summary Section */}
            {parsed.summary && (
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    bg="linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(214, 158, 46, 0.1) 100%)"
                    p={8}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="brand.800"
                    maxW="800px"
                    w="full"
                    textAlign="left"
                    boxShadow="0 4px 30px rgba(0, 0, 0, 0.5)"
                >
                    <Heading size="md" color="brand.400" mb={4} fontFamily="heading">
                        🔮บทสรุปและคำชี้แนะ
                    </Heading>
                    <VStack align="start" spacing={4} color="gray.300" fontSize="md" lineHeight="tall">
                        {parsed.summary.split('\n').map((line, i) => (
                            <Box key={i}>{renderStyledText(line)}</Box>
                        ))}
                    </VStack>

                    <Box w="full" h="1px" bg="brand.800" my={6} />

                    <Text color="brand.200" fontStyle="italic" textAlign="center" w="full">
                        "The cards guide, but you decide."
                    </Text>
                </MotionBox>
            )}

            <Button
                variant="ghost"
                colorScheme="brand"
                onClick={onReset}
                size="lg"
                _hover={{ bg: 'whiteAlpha.100', transform: 'scale(1.05)' }}
            >
                Consult the Cards Again
            </Button>
        </VStack>
    )
}

export default AnalysisScreen
