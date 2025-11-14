Just an amateur programmer.

<!---
kanipoko/kanipoko is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->

## Eurostat Labour Cost Extractor

自動車完成車メーカーのlabour cost情報をEurostatから抽出するツールです。

### 概要

このツールは、Eurostatの`lc_lci_r2_q`データセット(Labour cost index by NACE Rev. 2, quarterly)から、NACE分類C29(自動車・トレーラー・セミトレーラーの製造)に該当する労働コストデータを自動的に抽出します。

### 使用方法

1. 依存パッケージのインストール:
```bash
pip install -r requirements.txt
```

2. スクリプトの実行:
```bash
python extract_auto_labour_cost.py
```

3. 出力ファイル:
   - `automobile_labour_cost.csv` - 抽出されたデータ

### データについて

- **データソース**: Eurostat lc_lci_r2_q (Labour cost index by NACE Rev. 2, quarterly)
- **対象産業**: NACE C29 (Manufacture of motor vehicles, trailers and semi-trailers)
- **期間**: 2015年以降のデータ
- **指標**: 労働コスト指数 (2020=100)

### NACE C29について

NACE C29には以下が含まれます:
- 自動車の製造
- トレーラーおよびセミトレーラーの製造

労働コストには以下が含まれます:
- 総賃金・給与
- 雇用主の社会保険料
- 雇用に関連する税金(補助金を差し引いた額)

### トラブルシューティング

**403 Forbiddenエラーが発生する場合:**

一部の環境(特にクラウド/自動化環境)では、Eurostat APIが403エラーを返す場合があります。この場合は以下の方法をお試しください:

1. **ローカル環境で実行**: 自分のPC/ラップトップから実行してください
2. **手動ダウンロード**: [Eurostat Data Browser](https://ec.europa.eu/eurostat/databrowser/view/lc_lci_r2_q/default/table?lang=en)から手動でダウンロード
3. **VPN使用**: 異なるIPアドレスから接続を試みる

### 技術詳細

このスクリプトは以下の技術を使用しています:
- **pandasdmx**: SDMX 2.1プロトコルを使用してEurostatデータにアクセス
- **pandas**: データ分析と処理
- **SDMX API**: Eurostatの公式APIエンドポイント
