// NBL Brand Colors
export const colors = {
  primary: '#1E57F7',      // Nile Sapphire - Brand headers, primary CTAs, active states
  secondary: '#D4AF37',    // Heritage Gold - Awards, premium highlights, "Best Seller" tags
  background: '#F8FAFC',   // Frosted White - Main body background
  accent: '#0E111E',       // Deep Corbeau - Footer, text for high contrast
  success: '#10B981',      // Forest Green - Payment confirmation, "In Stock" indicators
  
  // Extended palette for common needs
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
  },
  error: '#EF4444',
  warning: '#F59E0B',
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, #1A4BC9 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary} 0%, #C19B1A 100%)`,
};
