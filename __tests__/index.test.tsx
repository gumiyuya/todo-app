import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Index from '../app/index';

describe('Index (メイン画面)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('ヘッダーと入力フィールドを表示する', () => {
    render(<Index />);

    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('タスクを入力してください...')).toBeInTheDocument();
  });

  it('新しいタスクを追加できる', async () => {
    render(<Index />);

    const input = screen.getByPlaceholderText('タスクを入力してください...');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.click(screen.getByText('+'));

    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
  });

  it('空のテキストではタスクを追加しない', () => {
    render(<Index />);

    fireEvent.click(screen.getByText('+'));

    expect(screen.queryByText('追加:')).not.toBeInTheDocument();
  });

  it('タスクの完了状態を切り替えられる', async () => {
    render(<Index />);

    const input = screen.getByPlaceholderText('タスクを入力してください...');
    fireEvent.change(input, { target: { value: 'タスク1' } });
    fireEvent.click(screen.getByText('+'));

    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
    });

    const checkbox = screen.getByText('☐');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('☑')).toBeInTheDocument();
    });
  });

  it('タスクをAsyncStorageに保存する', async () => {
    render(<Index />);

    const input = screen.getByPlaceholderText('タスクを入力してください...');
    fireEvent.change(input, { target: { value: '保存テスト' } });
    fireEvent.click(screen.getByText('+'));

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('TODO_TASKS');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed[0].title).toBe('保存テスト');
    });
  });

  it('AsyncStorageからタスクを読み込む', async () => {
    const mockTasks = [
      {
        id: '1',
        title: '事前保存タスク',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];
    await AsyncStorage.setItem('TODO_TASKS', JSON.stringify(mockTasks));

    render(<Index />);

    await waitFor(() => {
      expect(screen.getByText('事前保存タスク')).toBeInTheDocument();
    });
  });

  it('複数タスクを追加した場合、新しいタスクが一番上に表示される', async () => {
    render(<Index />);

    const input = screen.getByPlaceholderText('タスクを入力してください...');

    fireEvent.change(input, { target: { value: 'タスク1' } });
    fireEvent.click(screen.getByText('+'));

    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: 'タスク2' } });
    fireEvent.click(screen.getByText('+'));

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('TODO_TASKS');
      const parsed = JSON.parse(stored!);
      expect(parsed[0].title).toBe('タスク2');
      expect(parsed[1].title).toBe('タスク1');
    });
  });

  it('タスクを削除できる', async () => {
    render(<Index />);

    const input = screen.getByPlaceholderText('タスクを入力してください...');
    fireEvent.change(input, { target: { value: 'タスク1' } });
    fireEvent.click(screen.getByText('+'));

    const deleteButton = screen.getByText('削除');
    await waitFor(() => {
      expect(deleteButton).toBeInTheDocument();
    });

    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
    });
  });
});
