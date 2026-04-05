/**
 * PREMIUM DESIGN TOKENS
 * Reference examples of how to use the design system
 */

// ============================================
// COLOR SYSTEM
// ============================================

/**
 * Primary Colors
 * Premium blue accent for brand consistency
 */
export const PRIMARY_COLORS = {
  primary: {
    50: '#0052D4',  // Primary blue - main actions
    600: '#014F64',  // Darker blue - text
    900: '#1D4E8',  // Darkest blue - headings
  } as const,
} as const;

/**
 * Background Colors
 * Soft, clean backgrounds for readability
 */
export const BACKGROUND_COLORS = {
  surface: '#F9FAFB',  // White/gray-100 - main cards
  elevated: '#FDF2F2',  // Light gray - elevated elements
  paper: '#FFFFFF',  // Pure white - important info
} as const;

/**
 * Text Colors
 * Strong, readable text hierarchy
 */
export const TEXT_COLORS = {
  primary: '#1F2937',  // Main text - dark, high contrast
  secondary: '#6B7280',  // Secondary text - muted, labels
  'muted': '#64748B',  // Tertiary text - very subtle
} as const;

/**
 * Border Colors
 * Subtle, elegant borders for premium feel
 */
export const BORDER_COLORS = {
  default: '#E5E7EB',  // Default border - subtle
  elevated: '#F3F4F6',  // Raised element border
  subtle: '#D1D5DB',  // Very subtle border - barely visible
} as const;

/**
 * Spacing System
 * Consistent, breathable layout
 */
export const SPACING = {
  tight: 'gap-2',     // Close spacing for related elements
  relaxed: 'gap-4',    // Comfortable spacing for cards
  comfortable: 'gap-6',  // Generous spacing for sections
  section: 'gap-8',    // Section spacing - visual separation
} as const;

/**
 * Border Radius
 * Rounded, modern feel
 */
export const RADIUS = {
  sm: 'rounded-lg',   // Small elements
  md: 'rounded-xl',    // Medium elements
  lg: 'rounded-2xl',   // Large elements
  xl: 'rounded-3xl',   // Extra large elements
} as const;

/**
 * Shadows
 * Subtle, layered depth for premium feel
 */
export const SHADOWS = {
  soft: 'shadow-lg',    // Subtle shadow - default
  elevated: 'shadow-xl',   // Prominent element shadow - featured cards
  none: 'shadow-none',     // No shadow - clean look
} as const;

/**
 * Typography System
 * Clean, professional typography hierarchy
 */
export const TYPOGRAPHY = {
  hero: 'text-4xl font-bold tracking-tight',  // Large, bold - page headers
  h1: 'text-3xl font-bold text-gray-900',   // Section headers
  h2: 'text-2xl font-semibold text-gray-800',  // Card titles
  h3: 'text-lg font-semibold text-gray-700',  // Subheadings
  body: 'text-base text-gray-600',  // Main text - readable
  small: 'text-sm text-gray-500',  // Helper text - labels
  label: 'text-xs font-medium text-gray-400 uppercase tracking-wide',  // Uppercase labels
} as const;

/**
 * Card System
 * Premium card components with subtle shadows
 */
export const CARD_STYLES = {
  elevated: {
    className: 'bg-white shadow-xl border border-default rounded-2xl hover:shadow-elevated transition-all duration-200',
  },
  standard: {
    className: 'bg-white border border-default rounded-xl',
  },
} as const;

/**
 * Button System
 * Clean, modern buttons with micro-interactions
 */
export const BUTTON_STYLES = {
  primary: {
    className: 'bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-[1.02]',
  },
  secondary: {
    className: 'bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-default',
  },
  ghost: {
    className: 'bg-transparent text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200',
  },
} as const;

/**
 * Animation System
 * Smooth, professional transitions
 */
export const ANIMATIONS = {
  subtle: {
    duration: 'duration-200',
    timing: 'ease-out',
  },
  fadeIn: {
    duration: 'duration-300',
    timing: 'ease-in',
  },
} as const;