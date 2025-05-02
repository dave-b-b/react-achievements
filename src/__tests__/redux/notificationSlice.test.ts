import notificationReducer, { addNotification, clearNotifications } from '../../redux/notificationSlice';

describe('notificationSlice', () => {
  it('should handle initial state', () => {
    expect(notificationReducer(undefined, { type: 'unknown' })).toEqual({
      notifications: []
    });
  });

  it('should handle addNotification', () => {
    const actual = notificationReducer(undefined, addNotification('Test notification'));
    expect(actual.notifications).toEqual(['Test notification']);
  });

  it('should handle clearNotifications', () => {
    const state = { notifications: ['Test notification 1', 'Test notification 2'] };
    const actual = notificationReducer(state, clearNotifications());
    expect(actual.notifications).toEqual([]);
  });
}); 