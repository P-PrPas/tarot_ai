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
                const res = await fetch('/api/predict', {
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

    return (
        <VStack spacing={8} py={10} minH="100vh" px={4} overflowX="hidden">
            <VStack spacing={2}>
                <Text color="gray.400" fontSize="sm" letterSpacing="widest">THE QUESTION</Text>
                <Heading size="md" color="white" textAlign="center" maxW="800px">
                    "{intention}"
                </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full" maxW="1000px" justifyItems="center">
                {cards.map((card, index) => (
                    <MotionBox
                        key={index}
                        initial={{ opacity: 0, y: 50, rotateY: 180 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        style={{ perspective: 1000 }}
                    >
                        <VStack>
                            <Box
                                borderRadius="lg"
                                overflow="hidden"
                                boxShadow="0 0 30px rgba(214, 158, 46, 0.2)"
                                border="2px solid"
                                borderColor="brand.600"
                                _hover={{ borderColor: 'brand.400', transform: 'translateY(-10px)' }}
                                transition="all 0.3s"
                                position="relative"
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
                            <Text color="brand.200" fontSize="sm" fontWeight="bold">{card.name}</Text>
                        </VStack>
                    </MotionBox>
                ))}
            </SimpleGrid>

            <VStack
                bg="whiteAlpha.100"
                p={8}
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                maxW="800px"
                w="full"
                spacing={6}
                textAlign="left"
                backdropFilter="blur(10px)"
            >
                <Heading size="lg" color="brand.400" fontFamily="heading" alignSelf="center">
                    The Oracle Speaks
                </Heading>

                <Box color="gray.300" fontSize="lg" lineHeight="tall" whiteSpace="pre-wrap">
                    {prediction}
                </Box>

                <Box w="full" h="1px" bg="brand.800" />

                <Text color="brand.200" fontStyle="italic">
                    The cards guide, but you decide.
                </Text>
            </VStack>

            <Button
                variant="ghost"
                colorScheme="brand"
                onClick={onReset}
                _hover={{ bg: 'whiteAlpha.100' }}
            >
                Consult the Cards Again
            </Button>
        </VStack>
    )
}

export default AnalysisScreen
