import { getTheme, builtInThemes } from '../../../core/ui/themes';
import type { ThemeConfig } from '../../../core/ui/interfaces';

describe('Theme System', () => {
  describe('getTheme', () => {
    it('should return modern theme when requested', () => {
      const theme = getTheme('modern');
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('modern');
      expect(theme?.notification.background).toContain('linear-gradient');
      expect(theme?.modal.background).toContain('linear-gradient');
    });

    it('should return minimal theme when requested', () => {
      const theme = getTheme('minimal');
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('minimal');
      expect(theme?.notification.background).toBe('rgba(255, 255, 255, 0.98)');
      expect(theme?.modal.background).toBe('#ffffff');
    });

    it('should return gamified theme when requested', () => {
      const theme = getTheme('gamified');
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('gamified');
      expect(theme?.notification.background).toContain('linear-gradient');
      expect(theme?.notification.textColor).toBe('#22d3ee');
      expect(theme?.notification.accentColor).toBe('#f97316');
    });

    it('should return undefined for invalid theme name', () => {
      const theme = getTheme('invalid-theme');
      expect(theme).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const theme = getTheme('');
      expect(theme).toBeUndefined();
    });
  });

  describe('builtInThemes', () => {
    it('should have all three built-in themes', () => {
      expect(builtInThemes.modern).toBeDefined();
      expect(builtInThemes.minimal).toBeDefined();
      expect(builtInThemes.gamified).toBeDefined();
    });

    it('should have complete theme structure for modern', () => {
      const theme = builtInThemes.modern;
      expect(theme.name).toBe('modern');
      expect(theme.notification).toBeDefined();
      expect(theme.modal).toBeDefined();
      expect(theme.confetti).toBeDefined();
      
      // Check notification structure
      expect(theme.notification.background).toBeDefined();
      expect(theme.notification.textColor).toBeDefined();
      expect(theme.notification.accentColor).toBeDefined();
      expect(theme.notification.borderRadius).toBeDefined();
      expect(theme.notification.boxShadow).toBeDefined();
      expect(theme.notification.fontSize).toBeDefined();
      
      // Check modal structure
      expect(theme.modal.overlayColor).toBeDefined();
      expect(theme.modal.background).toBeDefined();
      expect(theme.modal.textColor).toBeDefined();
      expect(theme.modal.accentColor).toBeDefined();
      expect(theme.modal.borderRadius).toBeDefined();
      
      // Check confetti structure
      expect(theme.confetti.colors).toBeDefined();
      expect(Array.isArray(theme.confetti.colors)).toBe(true);
      expect(theme.confetti.particleCount).toBeDefined();
      expect(typeof theme.confetti.particleCount).toBe('number');
    });

    it('should have complete theme structure for minimal', () => {
      const theme = builtInThemes.minimal;
      expect(theme.name).toBe('minimal');
      expect(theme.notification.background).toBe('rgba(255, 255, 255, 0.98)');
      expect(theme.modal.background).toBe('#ffffff');
      expect(theme.confetti.colors.length).toBeGreaterThan(0);
    });

    it('should have complete theme structure for gamified', () => {
      const theme = builtInThemes.gamified;
      expect(theme.name).toBe('gamified');
      expect(theme.notification.textColor).toBe('#22d3ee');
      expect(theme.notification.accentColor).toBe('#f97316');
      expect(theme.modal.achievementLayout).toBe('badge');
      expect(theme.confetti.particleCount).toBe(100);
    });

    it('should have valid color arrays for confetti', () => {
      Object.values(builtInThemes).forEach(theme => {
        expect(Array.isArray(theme.confetti.colors)).toBe(true);
        expect(theme.confetti.colors.length).toBeGreaterThan(0);
        theme.confetti.colors.forEach(color => {
          expect(typeof color).toBe('string');
          // Should be valid hex or rgb color
          expect(color).toMatch(/^#|^rgb|^rgba/);
        });
      });
    });

    it('should have valid particle counts', () => {
      Object.values(builtInThemes).forEach(theme => {
        expect(typeof theme.confetti.particleCount).toBe('number');
        expect(theme.confetti.particleCount).toBeGreaterThan(0);
      });
    });
  });
});
