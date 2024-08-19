import React from 'react';
import { AchievementProvider, useAchievement } from '../../src/context/AchievementContext';

export default {
    title: 'AchievementProvider',
    component: AchievementProvider,
};

const TestComponent = () => {
    const { metrics, setMetrics, achievedAchievements, setAchievedAchievements } = useAchievement();
    return (
        <div>
            <button onClick={() => {
                setMetrics({
                    transactions: [...(metrics.transactions || []), 1],
                    categories: [...(metrics.categories || []), 1]
                })
            }}>
                Add Transaction and Category
            </button>
            <p>Transactions: {metrics.transactions ? metrics.transactions.length : 0}</p>
            <p>Categories: {metrics.categories ? metrics.categories.length : 0}</p>

            <button onClick={() => {
                setMetrics({
                    transactions: [],
                    categories: []
                 })

                setAchievedAchievements([])
            }}>
                Clear Transactions and Categories
            </button>
        </div>
    );
};

export const Default = () => (
    <AchievementProvider
        config={{
            transactions: [
                {
                    check: (value) => value.length >= 1,
                    data: {
                        id: 'first_transaction',
                        title: 'First Transaction',
                        description: 'You made your first transaction!',
                        icon: 'path/to/icon.png',
                    },
                },
            ],
        }}
    >
        <TestComponent />
    </AchievementProvider>
);

export const MultipleAchievements = () => (
    <AchievementProvider
        config={{
            transactions: [
                {
                    check: (value) => value.length >= 1,
                    data: { id: 'first_transaction', title: 'First Transaction', description: 'First transaction made!', icon: 'icon1.png' },
                },
                {
                    check: (value) => value.length >= 10,
                    data: { id: 'ten_transactions', title: 'Ten Transactions', description: 'Ten transactions made!', icon: 'icon2.png' },
                },
            ],
            categories: [
                {
                    check: (value) => value.length >= 1,
                    data: { id: 'first_category', title: 'First Category', description: 'First category created!', icon: 'icon2.png' },
                },
            ],
        }}
    >
        <TestComponent />
    </AchievementProvider>
);