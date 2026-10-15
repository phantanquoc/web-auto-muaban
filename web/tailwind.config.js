module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: '#0B0B12',
        charcoal: '#14141D',
        surface: '#1C1C28',
        gold: { DEFAULT: '#FFC531', soft: '#FFD968', dim: '#8a6d1c' },
        navy: { DEFAULT: '#1E1E2D', deep: '#161624' },
        mist: '#F1F2F6',
        muted: '#A1A1AA',
        rarity: {
          thuong: '#9CA3AF',
          hiem: '#3699FF',
          sieu: '#7C5CFF',
          cucpham: '#FFC531',
          thanthoai: '#F64E60',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl2: '14px' },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,.35)',
        pop: '0 16px 48px rgba(0,0,0,.5)',
      },
      spacing: { 18: '4.5rem' },
    },
  },
  plugins: [],
};
