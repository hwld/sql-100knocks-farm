/*
S-001: レシート明細データ（receipt）から全項目の先頭10件を表示し、どのようなデータを保有しているか目視で確認せよ。
*/

SELECT
    *
FROM receipt
LIMIT 10
;
