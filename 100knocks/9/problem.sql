/*
  S-009: 以下の処理において、出力結果を変えずにORをANDに書き換えよ。
SELECT * FROM store WHERE NOT (prefecture_cd = '13' OR floor_area > 900)
*/