/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080D14',
          secondary: '#0D1520',
          card: '#111B27',
          elevated: '#162231',
          border: '#243244',
          'border-subtle': '#182332',
          accent: '#38BDF8',
          'accent-hover': '#0EA5E9',
          primaryText: '#F8FAFC',
          secondaryText: '#94A3B8',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan-subtle': '0 0 15px -2px rgba(56, 189, 248, 0.12)',
        'cyan-glow': '0 0 25px -4px rgba(56, 189, 248, 0.25)',
        'danger-glow': '0 0 25px -4px rgba(239, 68, 68, 0.3)',
      },
    },
  },
  plugins: [],
}

