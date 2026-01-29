# TODO App

React Native (Expo) 学習用に作成した TODO アプリ。

## 機能

- タスクの追加・完了・削除
- スワイプで削除
- ドラッグ&ドロップで並び替え
- AsyncStorage によるデータ永続化

## 技術スタック

- React Native / Expo
- TypeScript
- react-native-gesture-handler
- react-native-reanimated
- react-native-draggable-flatlist

## セットアップ

```bash
npm install
npx expo start
```

## テスト

```bash
npm test
```

### テスト構成

| ファイル         | 説明                                         |
| ---------------- | -------------------------------------------- |
| `jest.config.js` | Jest 設定（preset, 環境, モック）            |
| `jest.setup.js`  | モック定義（reanimated, gesture-handler 等） |
| `__tests__/`     | テストファイル                               |

## ディレクトリ構成

```
todo-app/
├── app/
│   ├── _layout.tsx       # レイアウト
│   └── index.tsx         # メイン画面
├── components/
│   └── SwipeableRow.tsx  # スワイプ可能な行
├── __tests__/
│   ├── index.test.tsx
│   └── SwipeableRow.test.tsx
├── jest.config.js
├── jest.setup.js
├── babel.config.js
└── tsconfig.json
```

## CI

GitHub Actions でプッシュ・PR 時にテストを自動実行。

```yaml
# .github/workflows/test.yml
- npm test
- npx tsc --noEmit
```
