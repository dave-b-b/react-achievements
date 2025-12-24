---
sidebar_position: 2
---

# Theming & Built-in UI

React Achievements v3.6+ includes a complete built-in UI system with **zero external dependencies**. This guide covers themes, customization, and component injection.

## Overview

The built-in UI system provides:

- 🎨 **3 Professional Themes** - Modern, Minimal, Gamified
- 🔔 **Toast Notifications** - Smooth animations when achievements unlock
- 🎊 **Confetti Celebrations** - Automatic confetti for special moments
- 🏆 **Achievement Modal** - Display locked and unlocked achievements
- 🎯 **Component Injection** - Replace any part with your own components

---

## Quick Start

Enable the built-in UI by setting `useBuiltInUI={true}`:

```tsx
import { AchievementProvider } from 'react-achievements';

function App() {
  return (
    <AchievementProvider
      achievements={achievements}
      useBuiltInUI={true}  // Enable built-in UI
    >
      <YourApp />
    </AchievementProvider>
  );
}
```

That's it! You now have notifications, confetti, and all UI components ready to use.

---

## Built-in Themes

### Modern Theme (Default)

Clean, professional design with smooth animations:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'modern',
    notificationPosition: 'top-right'
  }}
>
  <YourApp />
</AchievementProvider>
```

**Features:**
- Glassmorphism effects
- Smooth slide-in animations
- Subtle shadows and gradients
- Professional color scheme

### Minimal Theme

Lightweight, distraction-free design:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'minimal',
    notificationPosition: 'bottom-center'
  }}
>
  <YourApp />
</AchievementProvider>
```

**Features:**
- Clean, simple design
- Minimal animations
- Black and white color scheme
- Small footprint

### Gamified Theme

Playful, game-like design with bold colors:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'gamified',
    notificationPosition: 'top-center',
    confettiConfig: {
      numberOfPieces: 200,
      recycle: false
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

**Features:**
- Bold, vibrant colors
- Bouncy animations
- Game-style borders and shadows
- Extra confetti!

---

## Notification Positioning

Control where achievement notifications appear:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    notificationPosition: 'top-right'  // Change position
  }}
>
  <YourApp />
</AchievementProvider>
```

**Available Positions:**
- `'top-left'`
- `'top-center'`
- `'top-right'` (default)
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'`

---

## Component Injection

Replace built-in components with your own custom implementations:

### Custom Notification Component

```tsx
import { AchievementProvider } from 'react-achievements';

function CustomNotification({ achievement, onClose }) {
  return (
    <div className="my-custom-notification">
      <h3>{achievement.title}</h3>
      <p>{achievement.description}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

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

### Custom Confetti Component

```tsx
import Fireworks from 'some-fireworks-library';

function CustomConfetti() {
  return <Fireworks duration={3000} />;
}

<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    ConfettiComponent: CustomConfetti
  }}
>
  <YourApp />
</AchievementProvider>
```

### Custom Modal Component

```tsx
function CustomModal({ achievements, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="my-custom-modal">
      <h2>Your Achievements</h2>
      {achievements.map(ach => (
        <div key={ach.id}>
          <span>{ach.icon}</span>
          <h3>{ach.title}</h3>
          <p>{ach.description}</p>
        </div>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    ModalComponent: CustomModal
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Confetti Configuration

Customize confetti behavior:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    confettiConfig: {
      numberOfPieces: 150,      // Number of confetti pieces
      recycle: false,           // Don't loop confetti
      gravity: 0.3,             // Falling speed
      wind: 0,                  // Horizontal drift
      colors: ['#ff0000', '#00ff00', '#0000ff'],  // Custom colors
      drawShape: (ctx) => {     // Custom shape
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Notification Duration

Control how long notifications stay on screen:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    notificationDuration: 5000  // 5 seconds (default is 3000)
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Disable Specific Features

You can disable confetti or notifications independently:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    disableConfetti: true,       // No confetti animations
    disableNotifications: false  // Keep notifications
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Migration from External UI (v3.5 and earlier)

If you're migrating from the external UI dependencies (`react-toastify`, `react-modal`, etc.):

### Before (v3.5 and earlier)

```tsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

<AchievementProvider achievements={achievements}>
  <YourApp />
  <ToastContainer position="top-right" autoClose={3000} />
</AchievementProvider>
```

### After (v3.6+)

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}  // Just add this!
>
  <YourApp />
</AchievementProvider>
```

**Benefits:**
- Remove 4 external dependencies
- Smaller bundle size (~50KB smaller)
- Better performance
- Consistent theming

---

## Advanced: Custom Theme Object

Create a completely custom theme:

```tsx
const customTheme = {
  notification: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  },
  modal: {
    backgroundColor: '#ffffff',
    color: '#333333',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px'
  },
  button: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px'
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

## Best Practices

### 1. Choose the Right Theme

- **Modern**: Professional apps, dashboards, SaaS
- **Minimal**: Content-focused apps, blogs, documentation
- **Gamified**: Games, educational apps, interactive experiences

### 2. Position Notifications Carefully

- **Top-right**: Standard for most apps (default)
- **Bottom-right**: When top has critical UI
- **Top-center**: Important announcements
- **Bottom-center**: Mobile-first apps

### 3. Customize Thoughtfully

- Start with built-in themes
- Only inject custom components when needed
- Keep animations subtle for professional apps
- Test on mobile devices

### 4. Performance

- Built-in UI is optimized for performance
- Confetti automatically stops after animation
- Notifications auto-close to prevent memory leaks
- Use `disableConfetti` for low-end devices if needed

---

## Troubleshooting

### Notifications Don't Appear

**Problem**: Achievements unlock but no notifications show.

**Solution**:
```tsx
// Make sure useBuiltInUI is true
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}  // ← Check this
>
```

### Confetti Doesn't Play

**Problem**: No confetti animation on achievement unlock.

**Solutions**:
1. Check that confetti isn't disabled:
```tsx
ui={{ disableConfetti: false }}
```

2. Check browser console for canvas errors

3. Try reducing `numberOfPieces` if performance is an issue

### Theme Not Applied

**Problem**: Custom theme doesn't appear.

**Solution**:
```tsx
// Theme must be inside ui object
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'minimal'  // ← Inside ui object
  }}
>
```

---

## Complete UI Configuration Reference

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    // Theme selection
    theme: 'modern' | 'minimal' | 'gamified',

    // Notification settings
    notificationPosition: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center',
    notificationDuration: 3000,  // milliseconds
    disableNotifications: false,

    // Confetti settings
    confettiConfig: {
      numberOfPieces: 150,
      recycle: false,
      gravity: 0.3,
      wind: 0,
      colors: string[]
    },
    disableConfetti: false,

    // Component injection
    NotificationComponent: YourCustomNotification,
    ConfettiComponent: YourCustomConfetti,
    ModalComponent: YourCustomModal,

    // Custom theme
    customTheme: {
      notification: { /* styles */ },
      modal: { /* styles */ },
      button: { /* styles */ }
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## What's Next?

- **[Builder API](./builder-api)** - Advanced achievement configuration
- **[Styling Guide](./styling)** - Deep customization of components
- **[API Reference](../api-reference)** - Complete API documentation
