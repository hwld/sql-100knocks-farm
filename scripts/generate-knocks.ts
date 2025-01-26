import { join } from "@std/path";
import { config } from "../src/config.ts";
import { DOMParser, Element } from "@b-fuze/deno-dom";
import {
  getExpectedDir,
  getExpectedFileName,
  getProblemPath,
} from "../src/problem/path.ts";

type KnockElement = {
  problem: Element;
  solutions: Element[];
};

type Knock = {
  problem: string;
  solutions: {
    sql: string;
    expectedCsv: string;
  }[];
};

async function generateKnocks() {
  config.load();

  const solutionHtml = await Deno.readTextFile(join(".", "solution.html"));
  const knockElements = parseKnockElements(solutionHtml);
  const knocks = parseKnocks(knockElements);

  await writeKnockFiles(knocks);
  await Deno.writeTextFile(
    join(config.get("100knocksDir"), "knocks.json"),
    JSON.stringify(knocks)
  );
}

await generateKnocks();

function parseKnockElements(html: string): KnockElement[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const divs = [...doc.querySelectorAll("body>div.jp-Cell")].slice(6, -1);

  const knockElements: KnockElement[] = [];

  let currentKnock: KnockElement | null = null;
  // divsが .jp-MarkdownCell, .jp-CodeCell, (.jp-CodeCell...)
  // の繰り返しで構成されていることを期待している
  divs.forEach((div, i) => {
    if (div.classList.contains("jp-MarkdownCell")) {
      if (currentKnock) {
        knockElements.push(currentKnock);
      }

      currentKnock = {
        problem: div,
        solutions: [],
      };
    } else if (div.classList.contains("jp-CodeCell")) {
      currentKnock!.solutions.push(div);
    }

    if (i === divs.length - 1 && currentKnock) {
      knockElements.push(currentKnock);
    }
  });

  return knockElements;
}

function parseKnocks(knockElements: KnockElement[]) {
  const knocks = knockElements.map((element): Knock => {
    return {
      problem: element.problem.textContent.trim(),
      solutions: element.solutions.map((solution) => {
        return {
          sql: solution.querySelector(".jp-Cell-inputWrapper pre")
            ?.textContent!,
          expectedCsv: tableToCsv(
            solution.querySelector(".jp-Cell-outputWrapper table")
          ),
        };
      }),
    };
  });

  /**
   * 1 ~ 79問までは上のロジックで対応できると思うけど、それ以降の問題は一つ問題につき1度のSQL実行とは限らないので対応できない
   */
  return knocks.slice(0, 79);
}

async function writeKnockFiles(knock: Knock[]) {
  const promisesToWriteKnocks = knock.map(async (knock, index) => {
    const problemNo = index + 1;

    const problemPath = getProblemPath(problemNo);
    const problemDir = join(problemPath, "..");
    await Deno.mkdir(problemDir, { recursive: true });
    await Deno.writeTextFile(problemPath, `/*\n  ${knock.problem}\n*/`);

    const expectedDir = getExpectedDir(problemNo);
    await Deno.mkdir(expectedDir, { recursive: true });
    const promisesToWriteSolutions = knock.solutions.map(
      async (solution, i) => {
        await Deno.writeTextFile(
          join(expectedDir, getExpectedFileName(i + 1)),
          solution.expectedCsv
        );
      }
    );
    await Promise.all(promisesToWriteSolutions);
  });

  await Promise.all(promisesToWriteKnocks);
}

function tableToCsv(table: Element | null) {
  if (!table) {
    return "";
  }

  const rows = table.querySelectorAll("tr");

  let csv = "";
  for (const row of rows) {
    const cells = row.querySelectorAll("td, th");
    const rowContent = [...cells].map((c) => c.textContent.trim()).join(",");
    csv += rowContent + "\n";
  }

  return csv;
}
