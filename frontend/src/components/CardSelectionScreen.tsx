import { Box, VStack, Heading, Text, useToast, HStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const MotionBox = motion(Box)

interface CardSelectionScreenProps {
    onComplete: (indices: number[]) => void
}

const CARDS_COUNT = 78
const SELECTION_LIMIT = 3

const CardSelectionScreen = ({ onComplete }: CardSelectionScreenProps) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const toast = useToast()

    const handleSelect = (index: number) => {
        if (selectedIndices.includes(index)) return

        if (selectedIndices.length >= SELECTION_LIMIT) {
            return
        }

        const newIndices = [...selectedIndices, index]
        setSelectedIndices(newIndices)

        if (newIndices.length === SELECTION_LIMIT) {
            toast({
                title: "Destiny Chosen",
                description: "The stars align...",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: 'top'
            })
            setTimeout(() => {
                onComplete(newIndices)
            }, 1000)
        }
    }

    // Arc Calculation Config
    const ARC_ANGLE = 100 // Degrees (Tighter angle keeps them on screen better with larger size)
    const START_ANGLE = -ARC_ANGLE / 2
    const RADIUS = 1500 // px (Flatter curve)
    // Let's pack all 78 but focus on center. The width is limited.

    // Helper to get card styles
    const getCardStyle = (index: number) => {
        // Map 0..77 to -50deg .. +50deg
        const angleStep = ARC_ANGLE / (CARDS_COUNT - 1)
        const rotation = START_ANGLE + (index * angleStep)

        // Convert polar to cartesian (offset from bottom center)
        // x = r * sin(theta)
        // y = r * (1 - cos(theta)) -> slight curve up

        const rad = (rotation * Math.PI) / 180
        const x = RADIUS * Math.sin(rad)
        const y = RADIUS * (1 - Math.cos(rad))

        // Dynamic z-index: center cards on top
        const centerIndex = CARDS_COUNT / 2
        const distFromCenter = Math.abs(index - centerIndex)
        const zIndex = 100 - Math.floor(distFromCenter)

        return { x, y, rotation, zIndex }
    }

    return (
        <VStack h="100vh" w="full" overflow="hidden" position="relative" bg="blackAlpha.900" justify="start" pt={10}>

            {/* Header & Slots Area */}
            <VStack spacing={8} zIndex={200}>
                <VStack spacing={2}>
                    <Heading
                        color="brand.400"
                        fontFamily="heading"
                        textShadow="0 0 10px rgba(214, 158, 46, 0.4)"
                    >
                        Select Your Path
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                        Choose {SELECTION_LIMIT - selectedIndices.length} more cards from the deck below
                    </Text>
                </VStack>

                {/* Selected Slots */}
                <HStack spacing={6}>
                    {Array.from({ length: SELECTION_LIMIT }).map((_, i) => {
                        const cardIndex = selectedIndices[i]
                        const isFilled = cardIndex !== undefined
                        return (
                            <Box
                                key={i}
                                w="80px"
                                h="120px"
                                border="2px dashed"
                                borderColor={isFilled ? "brand.400" : "brand.800"}
                                borderRadius="md"
                                position="relative"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg={isFilled ? "brand.900" : "transparent"}
                                boxShadow={isFilled ? "0 0 15px rgba(214, 158, 46, 0.3)" : "none"}
                            >
                                {isFilled ? (
                                    <MotionBox
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        w="full"
                                        h="full"
                                        bgGradient="linear(to-br, brand.600, brand.800)"
                                        borderRadius="sm"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text fontWeight="bold" color="white" fontSize="xl">{i + 1}</Text>
                                    </MotionBox>
                                ) : (
                                    <Text color="brand.800" fontSize="xs">Slot {i + 1}</Text>
                                )}
                            </Box>
                        )
                    })}
                </HStack>
            </VStack>

            {/* Deck Area */}
            <Box
                position="absolute"
                bottom="-250px" // Push origin down so the top of the arc is visible
                left="50%"
                w="0px" // Center point wrapper
                h="0px"
                style={{ perspective: 1000 }}
            >
                <AnimatePresence>
                    {Array.from({ length: CARDS_COUNT }).map((_, i) => {
                        // Don't render if selected (it's in the slot now)
                        if (selectedIndices.includes(i)) return null

                        const style = getCardStyle(i)

                        return (
                            <MotionBox
                                key={i}
                                position="absolute"
                                // Center origin
                                left={0}
                                bottom={0}
                                w="100px" // Bigger cards
                                h="160px"
                                borderRadius="md"
                                bgGradient="linear(to-br, brand.900, mystic.900)"
                                border="1px solid"
                                borderColor="brand.700"
                                cursor="pointer"
                                onClick={() => handleSelect(i)}
                                // Apply calculated transform
                                initial={{
                                    x: style.x,
                                    y: 800, // Start from below
                                    rotate: style.rotation,
                                    zIndex: style.zIndex
                                }}
                                animate={{
                                    x: style.x,
                                    y: style.y,
                                    rotate: style.rotation,
                                    zIndex: style.zIndex
                                }}
                                whileHover={{
                                    scale: 1.2,
                                    y: style.y - 100, // Pop up
                                    zIndex: 1000,
                                    boxShadow: '0 0 30px rgba(214, 158, 46, 0.8)',
                                    borderColor: 'brand.400'
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: i * 0.005 // Stagger entrance
                                }}
                                transformOrigin="bottom center"
                                style={{
                                    // Offset horizontal center to align card center to point
                                    marginLeft: '-50px', // Half of new width
                                    marginBottom: '300px' // Lift cards up from the origin point
                                }}
                            >
                                <Box
                                    w="full"
                                    h="full"
                                    opacity={0.3}
                                    backgroundImage="radial-gradient(circle, brand.800 1px, transparent 1px)"
                                    bgSize="5px 5px"
                                />
                            </MotionBox>
                        )
                    })}
                </AnimatePresence>
            </Box>

            {/* Decorative Mist/Light at bottom */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                w="full"
                h="300px"
                bgGradient="linear(to-t, blackAlpha.900, transparent)"
                pointerEvents="none"
                zIndex={50}
            />

        </VStack>
    )
}

export default CardSelectionScreen
