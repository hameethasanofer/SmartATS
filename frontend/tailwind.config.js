/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10b981', // Emerald 500
                    hover: '#059669',   // Emerald 600
                },
                secondary: {
                    DEFAULT: '#3b82f6', // Blue 500
                    hover: '#2563eb',   // Blue 600
                },
                accent: {
                    DEFAULT: '#f59e0b', // Amber 500
                },
                dark: {
                    bg: '#0f172a',      // Slate 900
                    card: '#1e293b',    // Slate 800
                    border: '#334155',  // Slate 700
                }
            },
            fontFamily: {
                heading: ['Inter', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'pulse-glow': 'pulseGlow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' },
                }
            }
        },
    },
    plugins: [],
}
