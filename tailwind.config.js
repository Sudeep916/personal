export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 70px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        glass: 'radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 40%), radial-gradient(circle at bottom right, rgba(59,130,246,0.12), transparent 25%)',
      },
      colors: {
        midnight: '#0f172a',
        nebula: '#1e293b',
      },
    },
  },
  plugins: [],
};
