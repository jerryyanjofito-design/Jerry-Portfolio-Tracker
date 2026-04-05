import type { Config } from "tailwindcss";

/**
 * PREMIUM FINTECH DESIGN SYSTEM
 * Phase 1: Visual System Upgrade
 * Focus: Premium fintech aesthetic with blue accent color
 */

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blue accent color - premium fintech feel
        primary: {
          DEFAULT: '#0052D4',
          50: '#014F64',
          100: '#1D4E8',
        },
        // Soft gray backgrounds - clean, professional
        background: {
          DEFAULT: '#F9FAFB',
          50: '#FFFFFF',
          100: '#FDF2F2',
        },
        // Text colors - strong hierarchy
        text: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          'text-secondary': '#64748B',
        },
        // Accent colors for positive/negative indicators
        accent: {
          DEFAULT: '#10B981',
          success: '#22C55E', // Green for gains
          danger: '#EF4444', // Red for losses/errors
        },
        // Border colors - subtle, elegant
        border: {
          DEFAULT: '#E5E7EB',
          50: '#F3F4F6',
        },
      },
    },
    plugins: [
      // Shadow plugin for subtle, layered shadows
      '@tailwindcss/shadow',
    ],
  },
};

export default config;