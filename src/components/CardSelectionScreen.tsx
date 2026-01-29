import { Box, SimpleGrid, Heading, VStack, Text, useToast } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const MotionBox = motion(Box)

interface CardSelectionScreenProps {
    onComplete: (cardIds: string[]) => void
}

const CARDS_COUNT = 22

const CardSelectionScreen = ({ onComplete }: CardSelectionScreenProps) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const toast = useToast()

    const handleSelect = (index: number) => {
        if (selectedIndices.includes(index)) return

        if (selectedIndices.length >= 4) {
            return
        }

        const newIndices = [...selectedIndices, index]

        // Random card logic
        let cardId: string
        do {
            const randomNum = Math.floor(Math.random() * 22)
            cardId = `m${randomNum.toString().padStart(2, '0')}.jpg`
        } while (selectedIds.includes(cardId)) // Prevent duplicate cards in a hand

        const newIds = [...selectedIds, cardId]

        setSelectedIndices(newIndices)
        setSelectedIds(newIds)

        if (newIds.length === 4) {
            toast({
                title: "Destiny Chosen",
                description: "The stars align...",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: 'top'
            })
            setTimeout(() => {
                onComplete(newIds)
            }, 1000)
        }
    }

    return (
        <VStack pt={10} spacing={8} h="100vh" overflow="hidden">
            <VStack spacing={2}>
                <Heading
                    color="brand.400"
                    fontFamily="heading"
                    textShadow="0 0 10px rgba(214, 158, 46, 0.4)"
                >
                    Select 4 Cards
                </Heading>
                <Text color="gray.400">
                    ({selectedIndices.length} / 4 chosen)
                </Text>
            </VStack>

            <Box
                h="full"
                w="full"
                overflowY="auto"
                px={4}
                pb={20}
                css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    'msOverflowStyle': 'none',
                    'scrollbarWidth': 'none'
                }}
            >
                <SimpleGrid columns={[3, 4, 6]} spacing={4} maxW="1200px" mx="auto">
                    {Array.from({ length: CARDS_COUNT }).map((_, i) => (
                        <MotionBox
                            key={i}
                            bgGradient={selectedIndices.includes(i) ? "linear(to-br, brand.600, brand.800)" : "linear(to-br, brand.900, mystic.900)"}
                            border="2px solid"
                            borderColor={selectedIndices.includes(i) ? "brand.300" : "brand.700"}
                            borderRadius="lg"
                            h="200px"
                            w="full"
                            cursor="pointer"
                            onClick={() => handleSelect(i)}
                            whileHover={{
                                y: -10,
                                boxShadow: '0 0 20px rgba(214, 158, 46, 0.4)',
                                borderColor: 'brand.400'
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                        >
                            {selectedIndices.includes(i) && (
                                <Text fontSize="2xl" fontWeight="bold" color="white">
                                    {selectedIndices.indexOf(i) + 1}
                                </Text>
                            )}
                            <Box
                                w="80%"
                                h="80%"
                                border="1px dashed"
                                borderColor="brand.800"
                                borderRadius="md"
                                opacity={selectedIndices.includes(i) ? 0 : 0.3}
                            />
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Box>
        </VStack>
    )
}

export default CardSelectionScreen
