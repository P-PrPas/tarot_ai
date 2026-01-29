import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const theme = extendTheme({
    config,
    fonts: {
        heading: `'Playfair Display', serif`,
        body: `'Inter', sans-serif`,
    },
    colors: {
        brand: {
            50: '#FDF7E7',
            100: '#FAEACA',
            200: '#F5D595',
            300: '#EFC060',
            400: '#EAB03B',
            500: '#D69E2E', // Base Gold
            600: '#B7791F',
            700: '#975A16',
            800: '#744210',
            900: '#5F370E',
        },
        mystic: {
            800: '#2D3748',
            900: '#1A202C', // Deep Dark
        }
    },
    styles: {
        global: {
            body: {
                bg: 'gray.900',
                color: 'whiteAlpha.900',
            },
        },
    },
})

export default theme
