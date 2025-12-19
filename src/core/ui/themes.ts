import { ThemeConfig } from './interfaces';

/**
 * Built-in theme presets
 */
export const builtInThemes: Record<string, ThemeConfig> = {
  /**
   * Modern theme - Dark gradients with vibrant accents
   * Inspired by contemporary achievement systems (Discord, Steam, Xbox)
   */
  modern: {
    name: 'modern',
    notification: {
      background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(50, 50, 70, 0.98) 100%)',
      textColor: '#ffffff',
      accentColor: '#4CAF50',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      fontSize: {
        header: '12px',
        title: '18px',
        description: '14px',
      },
    },
    modal: {
      overlayColor: 'rgba(0, 0, 0, 0.85)',
      background: 'linear-gradient(135deg, #1e1e32 0%, #323246 100%)',
      textColor: '#ffffff',
      accentColor: '#4CAF50',
      borderRadius: '16px',
      headerFontSize: '28px',
    },
    confetti: {
      colors: ['#FFD700', '#4CAF50', '#2196F3', '#FF6B6B'],
      particleCount: 50,
      shapes: ['circle', 'square'],
    },
  },

  /**
   * Minimal theme - Clean, light design with subtle accents
   * Perfect for professional or minimalist applications
   */
  minimal: {
    name: 'minimal',
    notification: {
      background: 'rgba(255, 255, 255, 0.98)',
      textColor: '#333333',
      accentColor: '#4CAF50',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontSize: {
        header: '11px',
        title: '16px',
        description: '13px',
      },
    },
    modal: {
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      background: '#ffffff',
      textColor: '#333333',
      accentColor: '#4CAF50',
      borderRadius: '12px',
      headerFontSize: '24px',
    },
    confetti: {
      colors: ['#4CAF50', '#2196F3'],
      particleCount: 30,
      shapes: ['circle'],
    },
  },

  /**
   * Gamified theme - Modern gaming aesthetic with sci-fi colors
   * Dark navy backgrounds with cyan and orange accents (2024 gaming trend)
   * Features square/badge-shaped achievement cards
   */
  gamified: {
    name: 'gamified',
    notification: {
      background: 'linear-gradient(135deg, rgba(5, 8, 22, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
      textColor: '#22d3ee', // Bright cyan
      accentColor: '#f97316', // Bright orange
      borderRadius: '6px',
      boxShadow: '0 8px 32px rgba(34, 211, 238, 0.4), 0 0 20px rgba(249, 115, 22, 0.3)',
      fontSize: {
        header: '13px',
        title: '20px',
        description: '15px',
      },
    },
    modal: {
      overlayColor: 'rgba(5, 8, 22, 0.85)',
      background: 'linear-gradient(135deg, #0f172a 0%, #050816 100%)',
      textColor: '#22d3ee', // Bright cyan
      accentColor: '#f97316', // Bright orange
      borderRadius: '8px',
      headerFontSize: '32px',
      achievementCardBorderRadius: '8px', // Square badge-like cards
      achievementLayout: 'badge', // Use badge/grid layout instead of horizontal list
    },
    confetti: {
      colors: ['#22d3ee', '#f97316', '#a855f7', '#eab308'], // Cyan, orange, purple, yellow
      particleCount: 100,
      shapes: ['circle', 'square'],
    },
  },
};

/**
 * Global theme registry for custom themes
 * Users can register themes via registerTheme()
 */
const themeRegistry = new Map<string, ThemeConfig>();

/**
 * Register a custom theme globally
 * Registered themes can be used by passing their name to the theme prop
 *
 * @example
 * ```tsx
 * import { registerTheme } from 'react-achievements';
 *
 * registerTheme({
 *   name: 'cyberpunk',
 *   notification: {
 *     background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
 *     textColor: '#00ffff',
 *     accentColor: '#ff00ff',
 *     borderRadius: '4px',
 *     boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
 *   },
 *   modal: {
 *     overlayColor: 'rgba(15, 15, 35, 0.95)',
 *     background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
 *     textColor: '#00ffff',
 *     accentColor: '#ff00ff',
 *     borderRadius: '4px',
 *   },
 *   confetti: {
 *     colors: ['#00ffff', '#ff00ff', '#ffff00'],
 *     particleCount: 80,
 *   },
 * });
 *
 * <AchievementProvider ui={{ theme: 'cyberpunk' }}>
 * ```
 */
export function registerTheme(theme: ThemeConfig): void {
  if (!theme.name) {
    throw new Error('[react-achievements] Theme must have a name property');
  }

  if (builtInThemes[theme.name]) {
    console.warn(
      `[react-achievements] Theme "${theme.name}" conflicts with a built-in theme name. Built-in themes always take precedence. Consider using a different name.`
    );
  }

  themeRegistry.set(theme.name, theme);
}

/**
 * Retrieve a theme by name
 * Checks built-in themes first, then registered custom themes
 *
 * @param name - Theme name (built-in or registered)
 * @returns Theme configuration or undefined if not found
 *
 * @example
 * ```tsx
 * import { getTheme } from 'react-achievements';
 *
 * const modernTheme = getTheme('modern');
 * const customTheme = getTheme('my-custom-theme');
 * ```
 */
export function getTheme(name: string): ThemeConfig | undefined {
  // Built-in themes take precedence
  return builtInThemes[name] || themeRegistry.get(name);
}

/**
 * List all available theme names
 * Includes both built-in and registered custom themes
 *
 * @returns Array of theme names
 *
 * @example
 * ```tsx
 * import { listThemes } from 'react-achievements';
 *
 * const allThemes = listThemes();
 * // ['modern', 'minimal', 'gamified', 'my-custom-theme', ...]
 * ```
 */
export function listThemes(): string[] {
  const builtInNames = Object.keys(builtInThemes);
  const registeredNames = Array.from(themeRegistry.keys());

  // Remove duplicates (registered themes with same name as built-in)
  const uniqueRegisteredNames = registeredNames.filter(
    (name) => !builtInThemes[name]
  );

  return [...builtInNames, ...uniqueRegisteredNames];
}

/**
 * Clear all registered custom themes
 * Useful for testing or dynamic theme management
 * Does not affect built-in themes
 *
 * @internal
 */
export function clearCustomThemes(): void {
  themeRegistry.clear();
}
