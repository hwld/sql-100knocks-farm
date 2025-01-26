import { assertEquals } from "@std/assert";
import { testEach } from "../test-util.ts";
import { isEqualSQLResult } from "./compare.ts";
import { SQLResult } from "./query.ts";

type TestCase = { a: SQLResult; b: SQLResult; isEqual: boolean };

const testCases: { [text: string]: TestCase } = {
  異なる1行の結果: {
    a: {
      columns: ["customer_id", "customer_name", "gender_cd"],
      rows: [["CS031415000172", "宇多田 貴美子", "1"]],
    },
    b: {
      columns: ["customer_id", "customer_name", "gender_cd"],
      rows: [["CS008415000145", "黒谷 麻緒", "1"]],
    },
    isEqual: false,
  },
  等しい1行の結果: {
    a: {
      columns: ["customer_id", "customer_name", "gender_cd"],
      rows: [["CS031415000172", "宇多田 貴美子", "1"]],
    },
    b: {
      columns: ["customer_id", "customer_name", "gender_cd"],
      rows: [["CS031415000172", "宇多田 貴美子", "1"]],
    },
    isEqual: true,
  },
};

testEach<TestCase>(testCases, ({ a, b, isEqual }) => {
  const actual = isEqualSQLResult(a, b);
  assertEquals(actual, isEqual);
});
