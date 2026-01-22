// useEffectの動作を理解するためのデモコンポーネント
// 学習用なので後で削除してOK

import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TimerDemo() {
  // ----- 1. タイマーの表示/非表示を切り替えるstate -----
  const [showTimer, setShowTimer] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>useEffect デモ</Text>

      {/* タイマーの表示/非表示を切り替えるボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log('🔘 ボタン押下: showTimer', showTimer, '→', !showTimer);
          setShowTimer(!showTimer);
        }}
      >
        <Text style={styles.buttonText}>
          {showTimer ? 'タイマーを非表示（アンマウント）' : 'タイマーを表示（マウント）'}
        </Text>
      </TouchableOpacity>

      {/* showTimerがtrueのときだけTimerコンポーネントを表示 */}
      {/* falseになるとTimerコンポーネントは「アンマウント」される */}
      {showTimer && <Timer />}

      <View style={styles.explanation}>
        <Text style={styles.explanationText}>
          ↑ボタンを押すとTimerコンポーネントが{'\n'}
          マウント(表示) / アンマウント(非表示)されます{'\n'}
          {'\n'}
          コンソールログを確認してください
        </Text>
      </View>
    </View>
  );
}

// ----- タイマーコンポーネント -----
// マウント時にタイマー開始、アンマウント時にタイマー停止
function Timer() {
  const [seconds, setSeconds] = useState(0);

  // ===== useEffect パターン1: マウント時のみ実行 =====
  useEffect(() => {
    // ここはコンポーネントが「マウント」されたときに実行される
    // マウント = 画面に表示されたとき
    console.log('✅ Timer マウント: コンポーネントが画面に表示されました');

    // クリーンアップ関数を返す（後述）
    return () => {
      // ここはコンポーネントが「アンマウント」されたときに実行される
      // アンマウント = 画面から消えたとき
      console.log('❌ Timer アンマウント: コンポーネントが画面から消えました');
    };
  }, []); // 空配列 = マウント時に1回だけ実行

  // ===== useEffect パターン2: タイマーとクリーンアップ =====
  useEffect(() => {
    console.log('⏱️ タイマー開始: 1秒ごとにカウントアップします');

    // setIntervalで1秒ごとにsecondsを更新
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // ----- クリーンアップ関数 -----
    // この関数は以下のタイミングで実行される:
    // 1. コンポーネントがアンマウントされたとき
    // 2. 依存配列の値が変わって、useEffectが再実行される直前
    //
    // なぜ必要？
    // → setIntervalを止めないと、コンポーネントが消えても
    //   タイマーが動き続けて、メモリリークになる
    return () => {
      console.log('⏹️ タイマー停止: クリーンアップ関数が実行されました');
      clearInterval(intervalId);
    };
  }, []); // 空配列 = マウント時に1回だけ実行

  // ===== useEffect パターン3: 依存配列に値がある場合 =====
  useEffect(() => {
    // secondsが変わるたびにここが実行される
    console.log(`📊 seconds changed: ${seconds}秒`);

    // 10秒経過したら特別なログ
    if (seconds === 10) {
      console.log('🎉 10秒経過しました！');
    }

    // クリーンアップ関数（依存配列に値がある場合）
    // → 次にuseEffectが実行される「直前」に呼ばれる
    return () => {
      console.log(`🧹 クリーンアップ: ${seconds}秒の状態を片付けます`);
    };
  }, [seconds]); // secondsが変わるたびに実行

  return (
    <View style={styles.timerBox}>
      <Text style={styles.timerLabel}>経過時間</Text>
      <Text style={styles.timerText}>{seconds}秒</Text>
      <Text style={styles.timerHint}>コンソールログを確認してください</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timerBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  timerHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 16,
  },
  explanation: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 22,
  },
});
