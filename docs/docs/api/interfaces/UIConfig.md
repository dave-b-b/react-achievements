# Interface: UIConfig

Defined in: [src/core/ui/interfaces.ts:100](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L100)

UI Configuration for AchievementProvider
Allows customization of all UI components

## Properties

### ConfettiComponent?

> `optional` **ConfettiComponent**: [`ConfettiComponent`](../type-aliases/ConfettiComponent.md)

Defined in: [src/core/ui/interfaces.ts:117](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L117)

Custom confetti component
If not provided, uses built-in or legacy component based on detection

***

### customTheme?

> `optional` **customTheme**: [`ThemeConfig`](ThemeConfig.md)

Defined in: [src/core/ui/interfaces.ts:129](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L129)

Direct theme configuration override
Takes precedence over theme name

***

### enableConfetti?

> `optional` **enableConfetti**: `boolean`

Defined in: [src/core/ui/interfaces.ts:147](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L147)

Enable/disable confetti animations

#### Default

```ts
true
```

***

### enableModal?

> `optional` **enableModal**: `boolean`

Defined in: [src/core/ui/interfaces.ts:153](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L153)

Enable/disable modal

#### Default

```ts
true
```

***

### enableNotifications?

> `optional` **enableNotifications**: `boolean`

Defined in: [src/core/ui/interfaces.ts:141](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L141)

Enable/disable notifications

#### Default

```ts
true
```

***

### ModalComponent?

> `optional` **ModalComponent**: [`ModalComponent`](../type-aliases/ModalComponent.md)

Defined in: [src/core/ui/interfaces.ts:111](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L111)

Custom modal component
If not provided, uses built-in or legacy component based on detection

***

### NotificationComponent?

> `optional` **NotificationComponent**: [`NotificationComponent`](../type-aliases/NotificationComponent.md)

Defined in: [src/core/ui/interfaces.ts:105](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L105)

Custom notification component
If not provided, uses built-in or legacy component based on detection

***

### notificationPosition?

> `optional` **notificationPosition**: [`NotificationPosition`](../type-aliases/NotificationPosition.md)

Defined in: [src/core/ui/interfaces.ts:135](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L135)

Notification positioning

#### Default

```ts
'top-center'
```

***

### theme?

> `optional` **theme**: `string`

Defined in: [src/core/ui/interfaces.ts:123](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/ui/interfaces.ts#L123)

Theme to use (built-in name or registered custom theme name)
Built-in themes: 'modern' (default), 'minimal', 'gamified'
