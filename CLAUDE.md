# marathon-coach（マラソンコーチ）

<!-- BEGIN:ai-ops-v2.1 -->
## 実行方針（AI駆動開発オペレーション v2.1）
- プロンプト冒頭の `TASK_ID` / `TASK_FILE` を現在タスクとし、**着手前に**
  `.claude/current-task.local` に TASK_FILE の絶対パスを保存してから始める
- 計画承認後は完了まで途中確認をしない
- 方針判断に迷ったら: **停止して質問せず**、最も妥当な案で進め、
  `C:/Users/巨漢とAI/brain-personal/decisions/marathon-coach/` に
  「迷った点 / 選んだ案 / 理由 / 代替案」を追記する
- 着手前に、方針判断が必要そうな点を**全て挙げて一度に**質問する
- 完了時は完了レポート（何をどう変えたか3行 / 証拠 / スコープ差分 / 迷った判断）を
  タスクファイルに書き、status を `ready-for-review` にする
  （`done` にするのは人間が最新 main で再テストしマージした後）
- このプロジェクトの信頼領域は **personal** — 参照してよい vault は
  `brain-personal` のみ。他領域の vault を読み書きしない
<!-- END:ai-ops-v2.1 -->
