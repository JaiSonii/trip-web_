import { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        white: '#ffffff',
        gray: {
          100: '#f5f5f5',
        },
        // Custom Colors
        whiteColor: '#ffffff',
        primaryColor: '0xffFF6A00',
        backgroundColor: '0xFFFFFFFa',
        primaryTextColor: '0xff000000',
        secondaryTextColor: '#5a5a5a',
        splashColor: 'rgba(255, 255, 255, 0.3)', // 0x4DFFFFFF in rgba
        cardColor: '#ffffff',
        cardSecondaryColor: '#cecece',
        buttonColor: '#000000',
        borderColor: '#c3c3c3',
        bottomNavBarColor: '#FE8631', 
        primaryOrange: '#ff6a00',
        lightOrange: '#ffa666',
        lightOrangeButtonColor: '#ffcaA4',
        destructive : '#D95C2B',
        buttonTextColor : '#6F2718 ',
        hoverColor : '#FFC49980',

        // Existing HSL-based Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      // Add Roboto font to the font family
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // Define the Roboto font family
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
