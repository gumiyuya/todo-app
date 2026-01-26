// メイン画面コンポーネント
// 機能:
// - タスクの追加・完了・削除
// - AsyncStorageによるデータの永続化
// - タスクの作成日時・完了日時の表示

import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import SwipeableRow from '../components/SwipeableRow';
import { Task } from '../types/task';

// AsyncStorageで使用するキー
const STORAGE_KEY = 'TODO_TASKS';

export default function Index() {
  // タスク一覧
  const [tasks, setTasks] = useState<Task[]>([]);
  // 入力フィールドのテキスト
  const [inputText, setInputText] = useState('');

  // AsyncStorageからタスクを読み込む
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 日付文字列をDateオブジェクトに変換
        const tasksWithDates = parsed.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
        }));
        setTasks(tasksWithDates);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  // 初回マウント時にタスクを読み込む
  useEffect(() => {
    loadTasks();
  }, []);

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const formatDateTime = (date: Date) => format(date, 'M/d HH:mm');

  const addTask = () => {
    if (inputText.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText.trim(),
      isCompleted: false,
      createdAt: new Date(),
      completedAt: null,
    };

    // 新しいタスクを一番上に表示するため先頭に追加
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);
    saveTasks(newTasks);
    setInputText('');
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;

      return {
        ...task,
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date() : null,
      };
    });
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // 並び替え完了時の処理
  const onDragEnd = ({ data }: { data: Task[] }) => {
    setTasks(data);
    saveTasks(data);
  };

  // スワイプ時に右側に表示される削除ボタン
  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => deleteTask(id)}>
      <Text style={styles.deleteActionText}>削除</Text>
    </TouchableOpacity>
  );

  // DraggableFlatListの各タスクアイテムをレンダリングする
  const renderTask = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>
      <SwipeableRow renderRightActions={() => renderRightActions(item.id)}>
        <View style={[styles.taskItem, isActive && styles.taskItemDragging]}>
          <TouchableOpacity style={styles.checkbox} onPress={() => toggleTask(item.id)}>
            <Text style={styles.checkboxText}>{item.isCompleted ? '☑' : '☐'}</Text>
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, item.isCompleted && styles.completedTask]}>
              {item.title}
            </Text>
            <Text style={[styles.taskDate, item.isCompleted && styles.completedTask]}>
              {item.isCompleted && item.completedAt
                ? `完了: ${formatDateTime(item.completedAt)} / 追加: ${formatDateTime(item.createdAt)}`
                : `追加: ${formatDateTime(item.createdAt)}`}
            </Text>
          </View>

          <TouchableOpacity onPressIn={drag} style={styles.dragHandleContainer}>
            <Text style={styles.dragHandle}>☰</Text>
          </TouchableOpacity>
        </View>
      </SwipeableRow>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TODO</Text>

      <View style={styles.inputContainer}>
        {/* キーボードのエンターキーを押したらタスクを追加 */}
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="タスクを入力してください..."
          onSubmitEditing={addTask}
        />
        {/* 追加ボタンを押したらタスクを追加 */}
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        onDragEnd={onDragEnd}
        containerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== コンテナ・レイアウト =====
  /** メインコンテナ */
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  /** ヘッダータイトル */
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  // ===== 入力エリア =====
  /** 入力フィールドのコンテナ */
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  /** テキスト入力フィールド */
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  /** 追加ボタン */
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  /** 追加ボタンのテキスト */
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // ===== タスクリスト =====
  /** タスク一覧のFlatList */
  list: {
    flex: 1,
  },
  /** 各タスクアイテムのコンテナ */
  taskItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  /** チェックボックスエリア */
  checkbox: {
    marginRight: 10,
  },
  /** チェックボックスのテキスト（☑/☐） */
  checkboxText: {
    fontSize: 24,
  },
  /** タスクのタイトルと日付を含むコンテナ */
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  /** タスクのタイトル */
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  /** タスクの日付表示 */
  taskDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  /** 完了済みタスクのスタイル（グレーアウト） */
  completedTask: {
    color: '#ccc',
  },
  /** スワイプ時に表示される削除ボタン */
  deleteAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  /** ドラッグ中のタスクアイテム */
  taskItemDragging: {
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  /** ドラッグハンドルのコンテナ */
  dragHandleContainer: {
    padding: 10,
    marginLeft: 5,
  },
  /** ドラッグハンドル */
  dragHandle: {
    fontSize: 20,
    color: '#ccc',
  },
});
