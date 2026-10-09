/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,mdx}'],
  theme: {
    extend: {
      // Mirrors the CSS variables in src/styles/globals.css.
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2') },
        border: token('border'),
        muted: token('muted'),
        primary: { DEFAULT: token('primary'), hover: token('primary-hover'), foreground: token('primary-foreground') },
        accent: token('accent'),
        success: token('success'),
        danger: token('danger'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
