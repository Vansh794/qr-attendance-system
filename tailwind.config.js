/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F0E8',
        surface: '#FFFFFF',
        ink: '#0A0A0A',
        accent: '#FF3B00',
        blue: '#0028FF',
        muted: '#6B6B6B',
        stripe: '#F0EBE0',
        success: '#00A86B',
        warning: '#F5A623',
        danger: '#D0021B',
      },
      fontFamily: {
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        brutal: '6px 6px 0 #0A0A0A',
        'brutal-sm': '3px 3px 0 #0A0A0A',
        accent: '4px 4px 0 #FF3B00',
      },
      borderWidth: {
        3: '3px',
        4: '4px',
        6: '6px',
      },
    },
  },
  plugins: [],
}
