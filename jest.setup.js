// =============================================================================
// Jest セットアップファイル
// テスト実行前に読み込まれ、モックやマッチャーを設定する
// =============================================================================

// -----------------------------------------------------------------------------
// toBeInTheDocument() などの DOM 用マッチャーを追加
// 例: expect(element).toBeInTheDocument()
// -----------------------------------------------------------------------------
require('@testing-library/jest-dom');

// -----------------------------------------------------------------------------
// react-native-reanimated のモック
//
// - reanimated はネイティブモジュールに依存しており、Jest（Node.js）では動作しない
// - アニメーション関連の機能をダミー実装に置き換える
// -----------------------------------------------------------------------------
jest.mock('react-native-reanimated', () => {
  const mockReact = require('react');
  const mockView = require('react-native-web').View;

  const Reanimated = {
    // default export 用
    default: {
      call: () => {},
      View: (props) => mockReact.createElement(mockView, props),
    },
    // named export 用: <Animated.View> の代わりに通常の View を使う
    View: (props) => mockReact.createElement(mockView, props),

    // Hooks のモック
    // useSharedValue: アニメーション用の値を保持。テストでは単純なオブジェクトを返す
    useSharedValue: jest.fn((init) => ({ value: init })),
    // useAnimatedStyle: アニメーションスタイルを返す。テストでは空オブジェクト
    useAnimatedStyle: jest.fn(() => ({})),

    // アニメーション関数: 実際にはアニメーションせず、値をそのまま返す
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),

    // runOnJS: UI スレッドから JS スレッドへの橋渡し。テストでは関数をそのまま返す
    runOnJS: jest.fn((fn) => fn),
  };

  Reanimated.default.View = (props) => mockReact.createElement(mockView, props);

  return Reanimated;
});

// -----------------------------------------------------------------------------
// react-native-gesture-handler のモック
//
// - ジェスチャー検出もネイティブモジュールに依存
// - 各種ジェスチャーハンドラーを通常の View に置き換える
// -----------------------------------------------------------------------------
jest.mock('react-native-gesture-handler', () => {
  const mockReact = require('react');
  const mockView = require('react-native-web').View;

  return {
    // 各種コンポーネントを View で代用（レンダリングだけできればOK）
    Swipeable: mockView,
    DrawerLayout: mockView,
    State: {},
    ScrollView: mockView,
    Slider: mockView,
    Switch: mockView,
    TextInput: mockView,
    ToolbarAndroid: mockView,
    ViewPagerAndroid: mockView,
    DrawerLayoutAndroid: mockView,
    WebView: mockView,
    NativeViewGestureHandler: mockView,
    TapGestureHandler: mockView,
    FlingGestureHandler: mockView,
    ForceTouchGestureHandler: mockView,
    LongPressGestureHandler: mockView,
    PanGestureHandler: mockView,
    PinchGestureHandler: mockView,
    RotationGestureHandler: mockView,
    RawButton: mockView,
    BaseButton: mockView,
    RectButton: mockView,
    BorderlessButton: mockView,
    FlatList: mockView,
    gestureHandlerRootHOC: jest.fn(),
    GestureHandlerRootView: (props) => mockReact.createElement(mockView, props),

    // Gesture API (新しい API) のモック
    // メソッドチェーンを模倣: Gesture.Pan().onStart().onEnd() のように使える
    Gesture: {
      Pan: jest.fn(() => ({
        activeOffsetX: jest.fn().mockReturnThis(), // this を返してチェーン可能に
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      })),
      Tap: jest.fn(() => ({
        onEnd: jest.fn().mockReturnThis(),
      })),
      Simultaneous: jest.fn(() => ({})),
    },

    // GestureDetector: 子要素をそのままレンダリング（ジェスチャー検出は無効化）
    GestureDetector: (props) => mockReact.createElement(mockView, null, props.children),
    Directions: {},
  };
});

// -----------------------------------------------------------------------------
// AsyncStorage のモック
//
// - AsyncStorage はデバイスのストレージにアクセスするネイティブモジュール
// - ライブラリが公式モックを提供しているのでそれを使用
// - メモリ上で動作し、テスト間で clear() できる
// -----------------------------------------------------------------------------
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// -----------------------------------------------------------------------------
// react-native-draggable-flatlist のモック
//
// - ドラッグ&ドロップ機能もネイティブ依存
// - 通常の FlatList として動作させ、drag 関数はダミーを渡す
// -----------------------------------------------------------------------------
jest.mock('react-native-draggable-flatlist', () => {
  const mockReact = require('react');
  const { FlatList, View: RNView } = require('react-native-web');

  return {
    __esModule: true, // ES Module として認識させる（default export 用）

    // DraggableFlatList → 通常の FlatList に置き換え
    // renderItem に渡される drag と isActive はダミー値
    default: ({ data, renderItem, keyExtractor }) =>
      mockReact.createElement(FlatList, {
        data,
        renderItem: ({ item }) => renderItem({ item, drag: jest.fn(), isActive: false }),
        keyExtractor,
      }),

    // ScaleDecorator: ドラッグ中の拡大エフェクト。テストでは単なる View
    ScaleDecorator: ({ children }) => mockReact.createElement(RNView, null, children),

    // 型定義用（実際には使わない）
    RenderItemParams: {},
  };
});
