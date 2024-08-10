# Welcome to React-Achievements!

A flexible and customizable achievement system for React applications.

## Installation

The first thing you need to do is install react-achievements:

`npm install react-achievements`

or if you're using yarn:
`yarn add react-achievements`

## Usage

### Set up the AchievementProvider

Wrap your app or a part of your app with the AchievementProvider:

```
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

The object that you pass to the initialState prop should have keys that match the metrics defined in your achievement configuration. For example, if your achievement configuration defines a 'transactions' metric, your initialState object should look like this:
```typescript
const user = {
    transactions: [
        {
            id: 1,
            amount: 100
        }, 
      {
          id: 2,
          amount: 200
      }
    ]
}
```

### Create an achievement configuration
Create a file (e.g., achievementConfig.js) to define your achievements:
(It is important that your icons be located in the public folder of your project)
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
      check: (value) => values.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) >= 100,
      data: {
          id: 'thousand_dollars',
          title: 'Big Spender',
          description: 'Spent a total of $1000', 
          icon: image2
      }
    },
  ],
  // Add more metrics and achievements as needed
};

export default achievementConfig;
```

### Update the location of the badges button
You can specify the position of the badges button by passing
badgesButtonPosition to the AchievementProvider:
```javascript
<AchievementProvider config={achievementConfig} badgesButtonPosition="bottom-right">
```

The possible values for badgesButtonPosition are 
- `'top-left'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-right'`

###  Use the useAchievement hook
In your components, use the useAchievement hook to update metrics and trigger achievement checks:
```javascript
import { useAchievement } from 'react-achievements';

function TransactionComponent() {
  const { setMetrics } = useAchievement();

  const handleNewTransaction = () => {
    // Your transaction logic here
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      transactions: (prevMetrics.transactions || 0) + 1
    }));
  };

  return (
    <button onClick={handleNewTransaction}>New Transaction</button>
  );
}
```

## Features

### Flexible Achievement System: 
Define custom metrics and achievement conditions.

### Automatic Achievement Tracking: 
Achievements are automatically checked and unlocked when metrics change.

### Achievement Notifications: 
A modal pops up when an achievement is unlocked.

### Persistent Achievements: 
Achieved achievements are stored in local storage.

### Achievement Gallery: 
Users can view all their unlocked achievements.

### Customizable UI: 
The achievement modal and badges button can be styled to fit your app's design.
Confetti Effect: A celebratory confetti effect is displayed when an achievement is unlocked.

## API
### AchievementProvider
#### Props:

1. config: An object defining your metrics and achievements.
storageKey (optional): A string to use as the key for localStorage. Default: 'react-achievements'
badgesButtonPosition (optional): Position of the badges button. Options: 'top-left', 'top-right', 'bottom-left', 'bottom-right'. Default: 'top-right'

2. useAchievement Hook Returns an object with:

3. setMetrics: Function to update the metrics.

4. metrics: Current metrics object. 
5. achievedAchievements: Array of achieved achievement IDs. 
6. showBadgesModal: Function to manually show the badges modal.

Customization
You can customize the appearance of the achievement modal, badges modal, and badges button by modifying their respective components in the package.
License
MIT
Copy
This README provides a comprehensive overview of how to use the react-achievements package, including setup, usage examples, features, and API details. You may want to adjust or expand certain sections based on the specific implementation details or additional features of your package.