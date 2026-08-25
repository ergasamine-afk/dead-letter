/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#f4f1eb',
    tint: '#d85b45',

    // Core surfaces
    background: '#211f1c',
    foreground: '#f4f1eb',

    // Cards / elevated surfaces
    card: '#2b2925',
    cardForeground: '#f4f1eb',

    // Primary action color (buttons, links, active states)
    primary: '#d85b45',
    primaryForeground: '#211f1c',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#35312c',
    secondaryForeground: '#f4f1eb',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#302d28',
    mutedForeground: '#b2aaa0',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#39423f',
    accentForeground: '#c8e5df',

    // Destructive actions (delete, error states)
    destructive: '#d85b45',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#49443d',
    input: '#49443d',
    hiddenBackground: '#0d1a23',
    hiddenCard: '#142b37',
    hiddenPrimary: '#72c7bd',
  },

  dark: {
    text: '#f4f1eb',
    tint: '#d85b45',
    background: '#211f1c',
    foreground: '#f4f1eb',
    card: '#2b2925',
    cardForeground: '#f4f1eb',
    primary: '#d85b45',
    primaryForeground: '#211f1c',
    secondary: '#35312c',
    secondaryForeground: '#f4f1eb',
    muted: '#302d28',
    mutedForeground: '#b2aaa0',
    accent: '#39423f',
    accentForeground: '#c8e5df',
    destructive: '#d85b45',
    destructiveForeground: '#ffffff',
    border: '#49443d',
    input: '#49443d',
    hiddenBackground: '#0d1a23',
    hiddenCard: '#142b37',
    hiddenPrimary: '#72c7bd',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
