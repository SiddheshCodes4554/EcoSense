/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "rgba(30, 41, 59, 0.7)",
        "card-foreground": "#f8fafc",
        primary: {
          DEFAULT: "#10b981", // Emerald
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#8b5cf6", // Violet
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#38bdf8", // Sky
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.1)",
        ring: "#10b981",
        aqi: {
          good: "#10b981",
          moderate: "#f59e0b",
          unhealthy: "#ef4444",
          hazardous: "#7e22ce",
          deadly: "#4c0519",
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "calc(1rem - 2px)",
        sm: "calc(1rem - 4px)",
      },
      animation: {
        'gradient-pulse': 'gradient-pulse 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-pulse': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
