import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          100: "#EEF2FF",
          900: "#1E1B4B",
        },
        accent: "#22D3EE",
        hordeRed: '#8B0000',
        hordeDark: '#1A0D0D',
        hordeAccent: '#B4A57A',
        hordeBorder: '#3C0F0F',
      },
      backgroundImage: {
        'horde-gradient': 'radial-gradient(circle at top, #2a0000 0%, #0b0000 100%)',
        'horde-sidebar': 'radial-gradient(circle at bottom left, #1a0d0d, #0b0000)',
        'horde-title': 'linear-gradient(to right, #B4A57A, #8B0000)',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
      },
      boxShadow: {
        'horde-glow': '0 0 20px rgba(139, 0, 0, 0.4)',
        'horde-glow-sm': '0 0 10px rgba(139, 0, 0, 0.6)',
      },
    },
  },
}
export default config
