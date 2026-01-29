import { Box, VStack, Heading, Text, Image, Button, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface AnalysisScreenProps {
    cardIds: string[]
    intention: string
    onReset: () => void
}

const AnalysisScreen = ({ cardIds, intention, onReset }: AnalysisScreenProps) => {

    return (
        <VStack spacing={8} py={10} minH="100vh" px={4} overflowX="hidden">
            <VStack spacing={2}>
                <Text color="gray.400" fontSize="sm" letterSpacing="widest">THE QUESTION</Text>
                <Heading size="md" color="white" textAlign="center" maxW="800px">
                    "{intention}"
                </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full" maxW="1000px">
                {cardIds.map((id, index) => (
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
                            >
                                <Image
                                    src={`/cards/${id}`}
                                    alt={`Tarot Card ${index + 1}`}
                                    objectFit="cover"
                                />
                            </Box>
                            <Text color="brand.200" fontSize="sm" fontWeight="bold">Card {index + 1}</Text>
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

                <Text color="gray.300" fontSize="lg" lineHeight="tall">
                    (AI Analysis will interpret these {cardIds.length} cards: <b>{cardIds.join(', ')}</b>)
                </Text>

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
