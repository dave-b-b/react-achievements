---
sidebar_position: 7
---

# Styling

Customize the appearance of achievements with CSS, inline styles, and custom themes.

## Overview

React Achievements provides multiple ways to customize styling:

- **Built-in themes** - Use pre-designed themes (modern, minimal, gamified)
- **Custom theme objects** - Override specific theme properties
- **CSS classes** - Target components with custom CSS
- **Inline styles** - Pass style objects directly
- **Component injection** - Replace entire components

---

## Using Built-in Themes

The easiest way to style achievements:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'modern'  // 'modern' | 'minimal' | 'gamified'
  }}
>
  <YourApp />
</AchievementProvider>
```

See the [Theming Guide](./theming) for details on each theme.

---

## Custom Theme Objects

Override specific properties of built-in themes:

```tsx
const customTheme = {
  notification: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    fontSize: '14px',
    fontFamily: '"Inter", sans-serif',
    border: '2px solid #333'
  },
  modal: {
    backgroundColor: '#ffffff',
    color: '#333333',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  badge: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  }
};

<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    customTheme
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## CSS Classes

All built-in components have CSS classes you can target:

### Notification Classes

```css
/* Notification container */
.react-achievements-notification {
  /* Your styles */
}

/* Notification when unlocking */
.react-achievements-notification--unlocked {
  animation: slideIn 0.3s ease-out;
}

/* Notification icon */
.react-achievements-notification__icon {
  font-size: 24px;
}

/* Notification title */
.react-achievements-notification__title {
  font-weight: bold;
  font-size: 16px;
}

/* Notification description */
.react-achievements-notification__description {
  font-size: 14px;
  opacity: 0.8;
}
```

### Modal Classes

```css
/* Modal overlay */
.react-achievements-modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Modal container */
.react-achievements-modal {
  max-width: 600px;
  padding: 24px;
}

/* Modal header */
.react-achievements-modal__header {
  border-bottom: 1px solid #e0e0e0;
}

/* Achievement item in modal */
.react-achievements-modal__item {
  padding: 12px;
  border-radius: 8px;
}

/* Locked achievement */
.react-achievements-modal__item--locked {
  opacity: 0.5;
  filter: grayscale(100%);
}

/* Unlocked achievement */
.react-achievements-modal__item--unlocked {
  border: 2px solid #4caf50;
}
```

### Badge Button Classes

```css
/* Badge button */
.react-achievements-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Badge count */
.react-achievements-badge__count {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

/* Pulse animation for new achievements */
.react-achievements-badge--pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## Inline Styles

Pass styles directly to components:

### BadgesButton Styles

```tsx
<BadgesButton
  unlockedAchievements={unlocked}
  onClick={() => setModalOpen(true)}
  style={{
    backgroundColor: '#ff6b6b',
    boxShadow: '0 4px 16px rgba(255,107,107,0.4)',
    fontSize: '20px'
  }}
/>
```

### BadgesModal Styles

```tsx
<BadgesModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  showAllAchievements={true}
  allAchievements={getAllAchievements()}
  style={{
    maxWidth: '800px',
    backgroundColor: '#f5f5f5',
    borderRadius: '16px'
  }}
/>
```

---

## Custom Animations

### Notification Entrance Animations

```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.react-achievements-notification {
  animation: slideInRight 0.3s ease-out;
}
```

### Achievement Unlock Animation

```css
@keyframes celebrate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

.react-achievements-notification--unlocked {
  animation: celebrate 0.6s ease-in-out;
}
```

### Badge Pulse on New Achievement

```css
@keyframes newAchievement {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
  }
}

.react-achievements-badge--new {
  animation: newAchievement 1s ease-in-out 3;
}
```

---

## Responsive Styling

Make achievements mobile-friendly:

```css
/* Desktop */
.react-achievements-notification {
  max-width: 400px;
  font-size: 16px;
}

/* Tablet */
@media (max-width: 768px) {
  .react-achievements-notification {
    max-width: 90%;
    font-size: 14px;
  }

  .react-achievements-badge {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .react-achievements-notification {
    font-size: 13px;
    padding: 12px;
  }

  .react-achievements-modal {
    max-width: 100%;
    margin: 10px;
  }
}
```

---

## Dark Mode Support

```css
/* Light mode (default) */
.react-achievements-notification {
  background-color: #ffffff;
  color: #333333;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .react-achievements-notification {
    background-color: #1a1a1a;
    color: #ffffff;
    border: 1px solid #333;
  }

  .react-achievements-modal {
    background-color: #2a2a2a;
    color: #ffffff;
  }
}

/* Or with a dark mode class */
.dark-mode .react-achievements-notification {
  background-color: #1a1a1a;
  color: #ffffff;
}
```

---

## Advanced: Complete Custom Styling

Create a fully custom-styled achievement system:

```tsx
// Custom notification component
function CustomNotification({ achievement, onClose }) {
  return (
    <div
      className="achievement-unlock"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        maxWidth: '350px',
        animation: 'slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>
        {achievement.icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
        {achievement.title}
      </h3>
      <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.9 }}>
        {achievement.description}
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Awesome!
      </button>
    </div>
  );
}

// Use custom component
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    NotificationComponent: CustomNotification
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## CSS-in-JS Libraries

### Styled-Components

```tsx
import styled from 'styled-components';

const StyledNotification = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

function CustomNotification({ achievement }) {
  return (
    <StyledNotification>
      <h3>{achievement.title}</h3>
      <p>{achievement.description}</p>
    </StyledNotification>
  );
}
```

### Emotion

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const notificationStyle = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  animation: slideIn 0.5s ease-out;
`;

function CustomNotification({ achievement }) {
  return (
    <div css={notificationStyle}>
      <h3>{achievement.title}</h3>
      <p>{achievement.description}</p>
    </div>
  );
}
```

### Tailwind CSS

```tsx
function CustomNotification({ achievement }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-xl shadow-2xl animate-slide-in">
      <div className="text-5xl text-center mb-3">{achievement.icon}</div>
      <h3 className="text-lg font-bold">{achievement.title}</h3>
      <p className="text-sm opacity-90 mt-1">{achievement.description}</p>
    </div>
  );
}
```

---

## Best Practices

### 1. Keep It Consistent

Use the same styling patterns across all achievement UI:

```tsx
const achievementStyles = {
  fontFamily: '"Inter", sans-serif',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

// Apply to all components
<AchievementProvider
  ui={{
    customTheme: {
      notification: { ...achievementStyles, /* ... */ },
      modal: { ...achievementStyles, /* ... */ },
      badge: { ...achievementStyles, /* ... */ }
    }
  }}
>
```

### 2. Test on Mobile

Always test custom styles on mobile devices:

```css
/* Ensure touch-friendly sizes */
.react-achievements-badge {
  min-width: 44px;
  min-height: 44px;
}

/* Prevent text overflow */
.react-achievements-notification__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 3. Use CSS Variables for Theming

```css
:root {
  --achievement-primary: #667eea;
  --achievement-secondary: #764ba2;
  --achievement-text: #333333;
  --achievement-background: #ffffff;
}

.dark-mode {
  --achievement-primary: #9f7aea;
  --achievement-secondary: #b794f4;
  --achievement-text: #ffffff;
  --achievement-background: #1a1a1a;
}

.react-achievements-notification {
  background-color: var(--achievement-background);
  color: var(--achievement-text);
}
```

### 4. Optimize Animations

```css
/* Use transform and opacity for smooth animations */
.react-achievements-notification {
  /* ✅ Good: GPU-accelerated */
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.3s, opacity 0.3s;
}

/* ❌ Avoid: Layout-shifting properties */
.react-achievements-notification {
  /* These cause reflows */
  left: 0;
  width: 400px;
}
```

---

## Troubleshooting

### Styles Not Applying

**Problem:** Custom styles don't appear.

**Solutions:**
1. Check CSS specificity:
```css
/* Increase specificity */
.react-achievements-notification.react-achievements-notification {
  /* Your styles */
}
```

2. Use `!important` (last resort):
```css
.react-achievements-notification {
  background-color: #ff0000 !important;
}
```

3. Inject styles after library loads:
```tsx
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    .react-achievements-notification {
      background-color: #ff0000;
    }
  `;
  document.head.appendChild(style);
}, []);
```

### Z-Index Issues

Notifications appearing behind other elements:

```css
.react-achievements-notification {
  z-index: 9999;
  position: relative;
}
```

---

## What's Next?

- **[Theming Guide](./theming)** - Explore built-in themes
- **[API Reference](../api-reference)** - Component prop documentation
- **[Builder API](./builder-api)** - Customize achievement configuration
