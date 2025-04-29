export const theme = {
  colors: {
    // Base colors
    background: {
      primary: '#000000',    // Main background
      secondary: '#1A1A1A',  // Card/surface background
      tertiary: '#2A2A2A'    // Elevated surface
    },

    // Brand colors
    brand: {
      orange: '#FF8C00',
      orangeLight: '#FFB74D',
      blue: '#3B82F6',
      blueLight: '#60A5FA'
    },

    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)'
    },

    // Status colors
    status: {
      success: '#22C55E',
      successLight: 'rgba(34, 197, 94, 0.1)',
      error: '#EF4444',
      errorLight: 'rgba(239, 68, 68, 0.1)',
      warning: '#F59E0B',
      warningLight: 'rgba(245, 158, 11, 0.1)'
    },

    // Trading specific colors
    trading: {
      profit: '#22C55E',
      loss: '#EF4444',
      neutral: '#9CA3AF'
    },

    // Border colors
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      active: '#FF8C00'
    }
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem'     // 48px
  },

  // Typography
  typography: {
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  // Transitions
  transitions: {
    fast: 'all 0.1s ease-in-out',
    default: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out'
  },

  // Border radius
  radius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  }
} as const;

// Utility type for theme colors
export type ThemeColor = keyof typeof theme.colors;

// Export the theme type
export type Theme = typeof theme;

// Default export
export default theme; 