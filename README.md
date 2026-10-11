# tokubechu.site

手書きの「とくべチュ、して」が斜めに流れ、その後に＝LOVEの公式動画を横スクロールで楽しめる非公式の静的サイト。

## ローカルプレビュー

```sh
cd ~/tokubechu.site
python3 -m http.server 4317 --bind 127.0.0.1 --directory public
```

http://127.0.0.1:4317 を開く。再読み込みすると最初から再生する。

## ファイル

- `public/index.html`: ページ情報、2つの文字素材、公式動画ギャラリー
- `public/styles.css`: 配色、背景、文字の大きさ・通過方向・時間
- `public/intro.js`: 文字素材の読み込み後に演出を開始
- `public/videos.js`: 横スクロール、動画選択、クリック時のYouTube埋め込み
- `public/assets/lettering/`: 見本の手書き文字に寄せて再生成した透過素材。現在は最初に生成した太いバージョンを使用。元画像そのものの切り抜きではない。

## 演出

1. 約0.25秒、淡い背景だけを表示。
2. 「とくべチュ、」が右上から入り、中央で減速して左下へ抜ける。
3. 前半が抜け始める頃（開始から約1.55秒）に「して」が左上から入り、中央で減速して右下へ抜ける。

文字は各1.9秒、全体で約3.5秒。中央でなめらかに減速し、そのまま加速して抜ける。2つの太い素材は文字の高さを基準に倍率をそろえ、濃い影と柔らかい影で読みやすくする。1回だけ再生した後、見出し・動画・補足を上から順に表示。端末の「視差効果を減らす」設定ではイントロを省略して動画を表示し、背景の動きを止める。

## 公式動画

- [Music Video](https://www.youtube.com/watch?v=F3P8vcZkIh4)
- [Dance Practice](https://www.youtube.com/watch?v=ZGVXDsrSMRs)
- [Live / ARENA TOUR 2025](https://www.youtube.com/watch?v=70GLdTQk-HY)

横スワイプ、トラックパッド、動画名ボタン、PCの矢印ボタンで切り替えられる。動画欄にフォーカスすると左右キー・Home・Endも使える。サムネイルを押すと通常のYouTubeプレイヤーで再生し、別の動画に切り替えると再生中のプレイヤーを終了する。自動再生で音は鳴らさず、音源ファイルは配信しない。

フレームワークとビルド処理は不要。Cloudflare Workers Static Assets では `public/` を配信対象にする。
