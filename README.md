# Welcome to React-Achievements!

A flexible and customizable achievement system for React applications.

## Installation

Install react-achievements using npm or yarn:

`npm install react-achievements`


`yarn add react-achievements`

## Usage

### Set up the AchievementProvider

Wrap your app or a part of your app with the AchievementProvider:

```javscript
import { AchievementProvider } from 'react-achievements';
import achievementConfig from './achievementConfig';

function App() {
  return (
    <AchievementProvider config={achievementConfig} initialState={<your_object>}>
      {/* Your app components */}
    </AchievementProvider>
  );
}
```

The `initialState` prop should contain the current state of your metrics. For example:

```javascript
const initialState = {
    transactions: [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 }
    ]
};
```

### Create an achievement configuration

Create a file (e.g., `achievementConfig.js`) to define your achievements:


```javascript


import image1 from './public/path/to/image1.png';
import image2 from './public/path/to/image2.png';

const achievementConfig = {
transactions: [
    {
        check: (value) => value.length >= 1,
        data: {
            id: 'first_transaction',
            title: 'First Transaction',
            description: 'Completed your first transaction',
            icon: image1
        }
    },
    {
        check: (value) => value.reduce((sum, transaction) => sum + transaction.amount, 0) >= 1000,
        data: {
            id: 'thousand_dollars',
            title: 'Big Spender',
            description: 'Spent a total of $1000',
            icon: image2
        }
    },
    ],
// Add more metrics and achievements as needed, but keys (in this case transactions) must match with those in initialState variable
};
```

export default achievementConfig;

Note: Ensure your icons are located in the public folder of your project.

### Customize the badges button location

```javascript
<AchievementProvider
    config={achievementConfig}
    badgesButtonPosition="bottom-right"
>
    {/* Your app components */}
</AchievementProvider>
```
Specify the position of the badges button:
Possible values for `badgesButtonPosition` are:
- 'top-left'
- 'top-right'
- 'bottom-left'
- 'bottom-right'



### Use the useAchievement hook

In your components, use the `useAchievement` hook to update metrics and trigger achievement checks:

```javascript
import { useAchievement } from 'react-achievements';

function TransactionComponent() {
    const { setMetrics } = useAchievement();
    
    const handleNewTransaction = (amount) => {
        setMetrics(prevMetrics => (
            {
            ...prevMetrics,
            transactions: [
    ...prevMetrics.transactions,
    { id: Date.now(), amount }
    ]
    }));
};

    return (
        <button onClick={() => handleNewTransaction(100)}>New Transaction</button>
    );
}
```
## Features

- Flexible Achievement System: Define custom metrics and achievement conditions.
- Automatic Achievement Tracking: Achievements are automatically checked and unlocked when metrics change.
- Achievement Notifications: A modal pops up when an achievement is unlocked.
- Persistent Achievements: Unlocked achievements and metrics are stored in local storage.
- Achievement Gallery: Users can view all their unlocked achievements.
- Confetti Effect: A celebratory confetti effect is displayed when an achievement is unlocked.

## API

### AchievementProvider

#### Props:
- `config`: An object defining your metrics and achievements.
- `initialState`: The initial state of your metrics.
- `storageKey` (optional): A string to use as the key for localStorage. Default: 'react-achievements'
- `badgesButtonPosition` (optional): Position of the badges button. Default: 'top-right'
- `styles` (optional): Custom styles for the achievement components.

### useAchievement Hook

Returns an object with:
- `setMetrics`: Function to update the metrics.
- `metrics`: Current metrics object.
- `unlockedAchievements`: Array of unlocked achievement IDs.
- `showBadgesModal`: Function to manually show the badges modal.

## License

MIT

This package provides a comprehensive achievement system for React applications. It's designed to be flexible, customizable, and easy to integrate into existing projects.