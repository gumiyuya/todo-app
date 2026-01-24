// カスタムSwipeableコンポーネント
// スナップ動作を実装: 閾値未満→閉じる、閾値以上→開く（中間状態なし）

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// 削除ボタンの幅
const ACTION_WIDTH = 80;
// スナップ閾値（この値を超えたら開く）
const SNAP_THRESHOLD = ACTION_WIDTH / 2;

type Props = {
  children: ReactNode;
  renderRightActions: () => ReactNode;
  onSwipeOpen?: () => void;
  onSwipeClose?: () => void;
};

export default function SwipeableRow({
  children,
  renderRightActions,
  onSwipeOpen,
  onSwipeClose,
}: Props) {
  // スワイプのX方向オフセット
  const translateX = useSharedValue(0);
  // スワイプ開始時の位置を保存
  const contextX = useSharedValue(0);
  // 現在開いているかどうか
  const isOpen = useSharedValue(false);

  const panGesture = Gesture.Pan()
    // 垂直スクロールと競合しないよう、水平方向のスワイプのみ反応
    .activeOffsetX([-10, 10])
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      // 左方向のみ（負の値）にスワイプ可能、0〜-ACTION_WIDTHの範囲に制限
      const newValue = contextX.value + event.translationX;
      translateX.value = Math.max(-ACTION_WIDTH, Math.min(0, newValue));
    })
    .onEnd((event) => {
      // 現在位置と速度を考慮してスナップ先を決定
      const shouldOpen = translateX.value < -SNAP_THRESHOLD || event.velocityX < -500;

      if (shouldOpen) {
        // 開く（削除ボタン表示）
        translateX.value = withTiming(-ACTION_WIDTH, { duration: 200 });
        if (!isOpen.value) {
          isOpen.value = true;
          if (onSwipeOpen) {
            runOnJS(onSwipeOpen)();
          }
        }
      } else {
        // 閉じる
        translateX.value = withTiming(0, { duration: 200 });
        if (isOpen.value) {
          isOpen.value = false;
          if (onSwipeClose) {
            runOnJS(onSwipeClose)();
          }
        }
      }
    });

  // 閉じる処理
  const closeSwipeable = () => {
    if (isOpen.value) {
      translateX.value = withTiming(0, { duration: 200 });
      isOpen.value = false;
      if (onSwipeClose) {
        onSwipeClose();
      }
    }
  };

  // タップジェスチャー
  const tapGesture = Gesture.Tap().onEnd(() => {
    if (isOpen.value) {
      runOnJS(closeSwipeable)();
    }
  });

  // パンとタップを同時に使用
  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // コンテンツのアニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* 右側のアクション（削除ボタン）- 背景に配置 */}
      <View style={styles.actionsContainer}>{renderRightActions()}</View>

      {/* メインコンテンツ - スワイプで移動 */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
  },
});
