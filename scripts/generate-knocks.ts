import { join } from "@std/path";
import { DOMParser, Element } from "@b-fuze/deno-dom";
import { getKnocksPath, getProblemPath } from "../src/problem/path.ts";
import { withConfigContext } from "../src/context/config.ts";

type KnockElement = {
  problem: Element;
  solutions: Element[];
};

type Knock = {
  no: number;
  problem: string;
  solutions: {
    no: number;
    sql: string;
    expectedCsv: string;
  }[];
};

async function generateKnocks() {
  const solutionHtml = await Deno.readTextFile(join(".", "solution.html"));
  const knockElements = parseKnockElements(solutionHtml);
  const knocks = parseKnocks(knockElements);

  await writeKnockFiles(knocks);
  await writeKnocksMeta(knocks);
}

await withConfigContext(generateKnocks);

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
  const knocks = knockElements.map((element, i): Knock => {
    return {
      no: i + 1,
      problem: element.problem.textContent.trim(),
      solutions: element.solutions.map((solution, i) => {
        return {
          no: i + 1,
          sql: solution
            .querySelector(".jp-Cell-inputWrapper pre")
            ?.textContent.split("%%sql")[1]
            .trim()!,
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

async function writeKnockFiles(knocks: Knock[]) {
  const promisesToWriteKnocks = knocks.map(async (knock, index) => {
    const problemNo = index + 1;

    const problemPath = getProblemPath(problemNo);
    const problemDir = join(problemPath, "..");
    await Deno.mkdir(problemDir, { recursive: true });
    await Deno.writeTextFile(problemPath, `/*\n  ${knock.problem}\n*/`);
  });

  await Promise.all(promisesToWriteKnocks);
}

async function writeKnocksMeta(knocks: Knock[]) {
  await Deno.writeTextFile(getKnocksPath(), JSON.stringify(knocks));
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
