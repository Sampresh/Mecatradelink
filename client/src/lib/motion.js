// Scroll-reveal props for a container: {...reveal()} or {...reveal('soft' | 'fade' | 'zoom')}.
// The inline motion script adds data-revealed / data-reveal-delay before React hydrates,
// so the element opts out of React's attribute-mismatch warning for those extra attributes.
export const reveal = (variant = '') => ({ 'data-reveal': variant, suppressHydrationWarning: true });
