/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#161320',
        coal: '#211c30',
        slate: {
          750: '#2c2640',
        },
        buzz: {
          DEFAULT: '#FF3D7F',
          50: '#fff0f5',
          100: '#ffd9e6',
          400: '#ff5c93',
          500: '#FF3D7F',
          600: '#e91e63',
        },
        volt: {
          DEFAULT: '#C6FF3D',
          400: '#d4ff66',
          500: '#C6FF3D',
        },
        sky2: {
          DEFAULT: '#3DD6FF',
          500: '#3DD6FF',
        },
        cream: '#F5F0E8',
      },
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        pop: '4px 4px 0 0 rgba(0,0,0,0.9)',
        'pop-sm': '2px 2px 0 0 rgba(0,0,0,0.9)',
        'pop-volt': '4px 4px 0 0 #C6FF3D',
      },
      keyframes: {
        buzzin: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255,61,127,0.5)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 22px rgba(255,61,127,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255,61,127,0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        buzzin: 'buzzin 0.3s ease-out',
        pulseRing: 'pulseRing 1.4s infinite',
        slideUp: 'slideUp 0.35s ease-out both',
        wiggle: 'wiggle 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
