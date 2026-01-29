import { Box, VStack, Heading, Text, useToast, HStack, useBreakpointValue, Button } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

interface CardSelectionScreenProps {
    onComplete: (indices: number[]) => void
}

const CARDS_COUNT = 78
const SELECTION_LIMIT = 3

const CardSelectionScreen = ({ onComplete }: CardSelectionScreenProps) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const toast = useToast()

    // Check for mobile
    const isMobile = useBreakpointValue({ base: true, md: false })
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleSelect = (index: number) => {
        if (selectedIndices.includes(index)) return

        if (selectedIndices.length >= SELECTION_LIMIT) {
            toast({
                title: "Path Chosen",
                description: "You have already selected 3 cards. Reveal your fate!",
                status: "info",
                duration: 2000,
                isClosable: true,
                position: 'top'
            })
            return
        }

        const newIndices = [...selectedIndices, index]
        setSelectedIndices(newIndices)
    }

    const handleReveal = () => {
        toast({
            title: "Destiny Chosen",
            description: "The stars align...",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: 'top'
        })
        setTimeout(() => {
            onComplete(selectedIndices)
        }, 1000)
    }

    // --- FAN GEOMETRY (Desktop) ---
    const PIVOT_BOTTOM = -1200
    const RADIUS = 1500
    const FAN_ANGLE = 80
    const START_ANGLE = -FAN_ANGLE / 2

    const getCardStyle = (index: number) => {
        const angleStep = FAN_ANGLE / (CARDS_COUNT - 1)
        let rotation = START_ANGLE + (index * angleStep)

        // Neighbor Pushing Logic
        if (hoveredIndex !== null && !isMobile) {
            const distance = index - hoveredIndex
            const PUSH_STRENGTH = 3 // Degrees to push
            const INFLUENCE_RANGE = 5 // How many cards away are affected

            if (Math.abs(distance) < INFLUENCE_RANGE && Math.abs(distance) > 0) {
                // Push away from the hovered card
                // If distance is negative (left side), push negative (more left)
                // If distance is positive (right side), push positive (more right)
                const pushFactor = 1 - (Math.abs(distance) / INFLUENCE_RANGE) // 1 at neighbor, 0 at outer edge
                const pushDir = distance > 0 ? 1 : -1
                rotation += pushDir * PUSH_STRENGTH * pushFactor
            }
        }

        const rad = (rotation * Math.PI) / 180
        const x = RADIUS * Math.sin(rad)
        const y = - RADIUS * Math.cos(rad)

        const centerIndex = CARDS_COUNT / 2
        const distFromCenter = Math.abs(index - centerIndex)
        // Base Z-index
        let zIndex = 100 - Math.floor(distFromCenter)

        // Hover Z-index boost logic is handled in Motion Props mostly, 
        // but we can adjust base if needed. keeping simple for now.

        return { x, y, rotation, zIndex }
    }

    return (
        <VStack
            h="100vh"
            w="full"
            overflow="hidden"
            position="relative"
            bg="blackAlpha.900"
            justify="start"
            pt={isMobile ? 6 : 12}
        >

            {/* Header & Slots Area */}
            <VStack spacing={isMobile ? 4 : 8} zIndex={200} w="full" px={4}>
                <VStack spacing={2}>
                    <Heading
                        color="brand.400"
                        fontFamily="heading"
                        textShadow="0 0 10px rgba(214, 158, 46, 0.4)"
                        size={isMobile ? "lg" : "xl"}
                        letterSpacing="widest"
                        textAlign="center"
                    >
                        SELECT YOUR PATH
                    </Heading>
                    <Text color="brand.200" fontSize={isMobile ? "sm" : "md"} fontStyle="italic">
                        Draw {SELECTION_LIMIT - selectedIndices.length} cards to reveal your fate
                    </Text>
                </VStack>

                {/* Selected Slots */}
                <HStack spacing={isMobile ? 3 : 8}>
                    {Array.from({ length: SELECTION_LIMIT }).map((_, i) => {
                        const cardIndex = selectedIndices[i]
                        const isFilled = cardIndex !== undefined
                        return (
                            <Box
                                key={i}
                                w={isMobile ? "70px" : "90px"}
                                h={isMobile ? "110px" : "140px"}
                                borderRadius="lg"
                                position="relative"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg="transparent" // Cleaner base
                                border="1px dashed" // UX: Clearly an empty slot
                                borderColor={isFilled ? "transparent" : "whiteAlpha.400"}
                            >
                                {isFilled ? (
                                    <MotionBox
                                        layoutId={`card-${cardIndex}`}
                                        initial={{ opacity: 0, scale: 0.5, y: isMobile ? 50 : 100 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        w="full"
                                        h="full"
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        boxShadow="0 0 20px rgba(214, 158, 46, 0.4)"
                                        border="1px solid"
                                        borderColor="brand.400"
                                        bg="brand.900"
                                        position="relative" // Ensure z-index works if needed
                                        zIndex={1}
                                    >
                                        <Box
                                            w="full" h="full" borderRadius="lg"
                                            backgroundImage="radial-gradient(circle at 50% 50%, rgba(214, 158, 46, 0.2) 2px, transparent 2px)"
                                            bgSize="10px 10px"
                                            opacity={0.5}
                                        />
                                        {/* Card Content Placeholder */}
                                        <Box
                                            position="absolute"
                                            inset="4px"
                                            border="1px solid rgba(214, 158, 46, 0.3)"
                                            borderRadius="md"
                                        />
                                        <Text fontWeight="bold" color="white" fontSize={isMobile ? "xl" : "2xl"} position="absolute">{i + 1}</Text>
                                    </MotionBox>
                                ) : (
                                    <Text color="whiteAlpha.300" fontSize={isMobile ? "xl" : "3xl"} fontFamily="serif">
                                        {['I', 'II', 'III'][i]}
                                    </Text>
                                )}
                            </Box>
                        )
                    })}
                </HStack>
                {/* Reveal Button */}
                <AnimatePresence>
                    {selectedIndices.length === SELECTION_LIMIT && (
                        <MotionButton
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            colorScheme="brand"
                            variant="solid"
                            size="lg"
                            bg="brand.500"
                            _hover={{ bg: "brand.400", boxShadow: "0 0 15px rgba(214, 158, 46, 0.6)" }}
                            onClick={handleReveal}
                            fontFamily="heading"
                            letterSpacing="wide"
                            boxShadow="0 0 10px rgba(0,0,0,0.5)"
                        >
                            REVEAL YOUR FATE
                        </MotionButton>
                    )}
                </AnimatePresence>
            </VStack>

            {/* --- DECK DISPLAY SWITCH --- */}

            {isMobile ? (
                /* === MOBILE: HORIZONTAL SCROLL (Cover Flow Lite) === */
                <Box
                    w="full"
                    flex={1}
                    mt={4}
                    overflowX="auto"
                    overflowY="hidden"
                    css={{
                        '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
                        scrollbarWidth: 'none'
                    }}
                    ref={scrollContainerRef}
                    display="flex"
                    alignItems="center"
                    px="50vw" // Push first and last item to center
                >
                    <HStack spacing={-10} pb={10} pr="50vw"> {/* Negative spacing for overlap */}
                        <AnimatePresence>
                            {Array.from({ length: CARDS_COUNT }).map((_, i) => {
                                if (selectedIndices.includes(i)) return null
                                return (
                                    <MotionBox
                                        layoutId={`card-${i}`}
                                        key={i}
                                        minW="120px"
                                        h="200px" // 1:1.67 Ratio
                                        borderRadius="lg"
                                        bg="brand.900"
                                        border="1px solid"
                                        borderColor="brand.600" // Visually lighter border
                                        cursor="pointer"
                                        boxShadow="0 4px 15px rgba(0,0,0,0.8)" // Deeper shadow
                                        onClick={() => handleSelect(i)}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            scrollSnapAlign: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Box
                                            w="full"
                                            h="full"
                                            borderRadius="lg"
                                            overflow="hidden"
                                            position="relative"
                                        >
                                            <Box w="full" h="full" bgGradient="linear(to-br, #1a202c, #2d3748)" />
                                            {/* Enhanced Texture */}
                                            <Box
                                                position="absolute" inset={0} opacity={0.4}
                                                backgroundImage="radial-gradient(circle at 50% 50%, rgba(214, 158, 46, 0.4) 1.5px, transparent 1.5px)"
                                                bgSize="14px 14px"
                                            />
                                            {/* Rim Light Effect */}
                                            <Box
                                                position="absolute" inset="0"
                                                borderRadius="lg"
                                                boxShadow="inset 0 0 10px rgba(255,255,255,0.1), inset 0 0 2px rgba(214, 158, 46, 0.3)"
                                                css={{ pointerEvents: 'none' }}
                                            />
                                            <Box
                                                position="absolute" inset="5px"
                                                border="1px solid rgba(214, 158, 46, 0.5)"
                                                borderRadius="md"
                                            />
                                        </Box>
                                    </MotionBox>
                                )
                            })}
                        </AnimatePresence>
                    </HStack>

                    {/* Guidance for Mobile */}
                    <Text
                        position="absolute"
                        bottom="20px"
                        left="0"
                        right="0"
                        textAlign="center"
                        color="whiteAlpha.600"
                        fontSize="sm"
                        fontWeight="medium"
                        pointerEvents="none"
                        textShadow="0 2px 4px black"
                    >
                        Swipe & Tap to Select
                    </Text>
                </Box>
            ) : (
                /* === DESKTOP: FAN LAYOUT === */
                <Box
                    position="absolute"
                    bottom={`${PIVOT_BOTTOM}px`}
                    left="50%"
                    w="0px"
                    h="0px"
                    style={{ perspective: 1000 }}
                >
                    {/* Guidance Text */}
                    {selectedIndices.length < 3 && (
                        <MotionBox
                            position="absolute"
                            top="-550px"
                            left="-150px"
                            w="300px"
                            textAlign="center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                            pointerEvents="none"
                        >
                            <Text color="brand.200" fontFamily="serif" fontStyle="italic" opacity={0.8} fontSize="lg">
                                ✨ Pick a card from the deck ✨
                            </Text>
                            <Box borderLeft="1px solid" borderColor="brand.200" h="40px" w="0px" mx="auto" mt={2} opacity={0.5} />
                        </MotionBox>
                    )}

                    <AnimatePresence>
                        {Array.from({ length: CARDS_COUNT }).map((_, i) => {
                            if (selectedIndices.includes(i)) return null
                            const style = getCardStyle(i)

                            return (
                                <MotionBox
                                    layoutId={`card-${i}`}
                                    key={i}
                                    position="absolute"
                                    left={0}
                                    bottom={0}
                                    w="120px"
                                    h="200px"
                                    borderRadius="lg"
                                    bg="brand.900"
                                    border="1px solid"
                                    borderColor="brand.700"
                                    cursor="pointer"
                                    onHoverStart={() => setHoveredIndex(i)}
                                    // We don't strictly need onHoverEnd if we want 'last hovered' to stay or just snap back on mouse leave div
                                    onHoverEnd={() => setHoveredIndex(null)}
                                    onClick={() => handleSelect(i)}
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{
                                        x: style.x,
                                        y: style.y,
                                        rotate: style.rotation,
                                        zIndex: hoveredIndex === i ? 1000 : style.zIndex, // boost z-index on hover
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 120, damping: 14 } // Smooth movement for neighbors
                                    }}
                                    whileHover={{
                                        scale: 1.25,
                                        y: style.y - 60, // Clear 'pop up'
                                        boxShadow: '0 0 40px rgba(214, 158, 46, 0.6), 0 0 10px white',
                                        borderColor: 'brand.300'
                                    }}
                                    transformOrigin="bottom center"
                                    style={{
                                        marginLeft: '-60px',
                                    }}
                                >
                                    <Box
                                        w="full"
                                        h="full"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        position="relative"
                                    >
                                        <Box w="full" h="full" bgGradient="linear(to-br, #1a202c, #2d3748)" />
                                        {/* Texture */}
                                        <Box
                                            position="absolute" inset={0} opacity={0.4}
                                            backgroundImage="radial-gradient(circle at 50% 50%, rgba(214, 158, 46, 0.6) 1.5px, transparent 1.5px)"
                                            bgSize="14px 14px"
                                        />
                                        {/* Rim Light / Glow Overlay */}
                                        <Box
                                            position="absolute" inset="0"
                                            className="rim-light"
                                            boxShadow="inset 0 0 15px rgba(214, 158, 46, 0.2)"
                                            borderRadius="lg"
                                        />
                                        <Box
                                            position="absolute" inset="6px"
                                            border="1px solid rgba(214, 158, 46, 0.5)"
                                            borderRadius="md"
                                        />
                                        <Box
                                            position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)"
                                            w="30px" h="30px" border="1px solid rgba(214, 158, 46, 0.3)" borderRadius="full"
                                        />
                                    </Box>
                                </MotionBox>
                            )
                        })}
                    </AnimatePresence>
                </Box>
            )}

            {/* Background Atmosphere */}
            <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
                <Box position="absolute" inset={0} bgGradient="radial(circle at center, #2C313D 0%, #000000 100%)" opacity={0.6} />
                <Box
                    position="absolute" inset={0} opacity={0.07}
                    backgroundImage="url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJnoiPjxmZUdlbmVyYXRlSW1hZ2UgdHlwZT0idHVyYnVsZW5jZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')"
                />
                <Box
                    position="absolute"
                    inset={0}
                    bg="radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.9) 100%)"
                />
            </Box>

        </VStack>
    )
}

export default CardSelectionScreen
