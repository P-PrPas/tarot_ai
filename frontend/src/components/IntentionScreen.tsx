import { Box, VStack, Heading, Input, Button, Text, Container } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const MotionBox = motion(Box)

interface IntentionScreenProps {
    onComplete: (intention: string) => void
}

const IntentionScreen = ({ onComplete }: IntentionScreenProps) => {
    const [intention, setIntention] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (intention.trim()) {
            onComplete(intention)
        }
    }

    return (
        <Container maxW="container.md" h="100vh" centerContent justifyContent="center">
            <VStack spacing={8} w="full" as="form" onSubmit={handleSubmit}>
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <Heading
                        size="2xl"
                        textAlign="center"
                        color="brand.500"
                        fontFamily="heading"
                        textShadow="0 0 20px rgba(214, 158, 46, 0.3)"
                    >
                        The Oracle Awaits
                    </Heading>
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    w="full"
                >
                    <Text textAlign="center" fontSize="xl" mb={4} color="gray.400">
                        What seeks an answer within your soul?
                    </Text>
                    <Input
                        variant="flushed"
                        placeholder="e.g., What does my future hold in love?"
                        size="lg"
                        fontSize="2xl"
                        textAlign="center"
                        color="white"
                        focusBorderColor="brand.500"
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        py={8}
                        _placeholder={{ color: 'gray.600' }}
                    />
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: intention ? 1 : 0, scale: intention ? 1 : 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        type="submit"
                        size="lg"
                        colorScheme="brand"
                        variant="outline"
                        px={12}
                        py={8}
                        fontSize="xl"
                        isDisabled={!intention.trim()}
                        _hover={{
                            bg: 'brand.500',
                            color: 'gray.900',
                            boxShadow: '0 0 20px rgba(214, 158, 46, 0.6)'
                        }}
                    >
                        Begin Ritual
                    </Button>
                </MotionBox>
            </VStack>
        </Container>
    )
}

export default IntentionScreen
