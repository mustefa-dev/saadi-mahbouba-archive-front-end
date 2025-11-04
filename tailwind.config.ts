import { withShurikenUI } from '@shuriken-ui/tailwind'
import { join } from 'pathe'
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from "tailwindcss/colors"
/**
 * This is the Tailwind config file for the demo.
 * It extends the default config from @shuriken-ui/tailwind
 *
 * You can add/override your own customizations here.
 */
export default withShurikenUI({
  content: [join(__dirname, `/utils/**/*.ts`)], // Parse the utils folder for demo
  safelist: [
    // Those classes are used in the pageTransition config in nuxt.config.ts
    'transition-all', 'duration-200', 'duration-75', 'ease-out', 'ease-in', 'opacity-0', 'opacity-100',
  ],
  theme: {

    // Custom fonts
    fontFamily: {
      sans: ['Tajawal', 'sans-serif'],
      heading: ['Tajawal', 'sans-serif'],
      alt: ['Tajawal', 'sans-serif'],
      mono: ['Fira Code Variable', ...defaultTheme.fontFamily.mono],
    },
    borderRadius:{
      DEFAULT:'4px',
      'none':'0px',
      'sm':'8px',
      'md':'16px',
      'lg':'24px',
      'xl':'32px',
      '2xl':'48px',
      '3xl':'60px',
      'full':'50%',
    },
    extend: {
      // Custom colors
      colors: {
        primary: colors.blue,
        secondary: colors.violet,
        muted: colors.slate,
        success: {
          100: '#FBFEFD',
          200: '#EAFAF3',
          300: '#D6F5E8',
          400: '#98E7C5',
          500: '#27A771',
          600: '#176343',
          700: '#114A32',
          800: '#082116',
          900: '#04110B',
        },
        danger: {
          100: '#FEFBFB',
          200: '#FAEAEA',
          300: '#F5D6D6',
          400: '#E79898',
          500: '#A72727',
          600: '#631717',
          700: '#4A1111',
          800: '#210808',
          900: '#110404',
        },
        warning: {
          100: '#FEFDFB',
          200: '#FBF7E9',
          300: '#F7EFD4',
          400: '#EBD893',
          500: '#F08C1A',
          600: '#BFA340',
          700: '#45390C',
          800: '#231C06',
          900: '#110E03',
        },
        info: {
          100: '#cdd9ee',
          200: '#9bb4dd',
          300: '#6a8ecd',
          400: '#3869bc',
          500: '#0643AB',
          600: '#053689',
          700: '#042867',
          800: '#021b44',
          900: '#010d22',
        },
        background: {
          dark: '#191A1C',
          light: '#FCFDFD'
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.65s linear infinite',
      },
    },
  },
})
