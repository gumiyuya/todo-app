import { render, screen } from '@testing-library/react';
import { Text, TouchableOpacity } from 'react-native';
import SwipeableRow from '../components/SwipeableRow';

describe('SwipeableRow', () => {
  const mockOnSwipeOpen = jest.fn();
  const mockOnSwipeClose = jest.fn();

  const renderRightActions = () => (
    <TouchableOpacity>
      <Text>削除</Text>
    </TouchableOpacity>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('子要素を正しくレンダリングする', () => {
    render(
      <SwipeableRow renderRightActions={renderRightActions}>
        <Text>タスク内容</Text>
      </SwipeableRow>
    );

    expect(screen.getByText('タスク内容')).toBeInTheDocument();
  });

  it('右側のアクション（削除ボタン）をレンダリングする', () => {
    render(
      <SwipeableRow renderRightActions={renderRightActions}>
        <Text>タスク内容</Text>
      </SwipeableRow>
    );

    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('onSwipeOpenとonSwipeCloseコールバックを受け取る', () => {
    const { container } = render(
      <SwipeableRow
        renderRightActions={renderRightActions}
        onSwipeOpen={mockOnSwipeOpen}
        onSwipeClose={mockOnSwipeClose}
      >
        <Text>タスク内容</Text>
      </SwipeableRow>
    );

    expect(container).toBeTruthy();
  });
});
