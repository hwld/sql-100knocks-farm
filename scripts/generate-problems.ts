import { join } from "@std/path";
import { DOMParser, Element } from "@b-fuze/deno-dom";
import { getAllProblemsPath, getProblemPath } from "../src/problem/path.ts";
import { withConfigContext } from "../src/context/config.ts";
import { Problem } from "../src/problem/problem.ts";
import { writeExpectedResults } from "../src/problem/fs.ts";
import { parseCsv } from "../src/sql/csv.ts";

type ProblemElement = {
  problemText: Element;
  solutions: Element[];
};

async function generateProblems() {
  const solutionHtml = await Deno.readTextFile(join(".", "solution.html"));
  const problemElements = parseProblemElements(solutionHtml);
  const problems = parseProblems(problemElements);

  await writeProblemFiles(problems);
  await writeAllProblemFile(problems);
}

await withConfigContext(generateProblems);

function parseProblemElements(html: string): ProblemElement[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const divs = [...doc.querySelectorAll("body>div.jp-Cell")].slice(6, -1);

  const problemElements: ProblemElement[] = [];

  let currentProblemEl: ProblemElement | null = null;
  // divsが .jp-MarkdownCell, .jp-CodeCell, (.jp-CodeCell...)
  // の繰り返しで構成されていることを期待している
  divs.forEach((div, i) => {
    if (div.classList.contains("jp-MarkdownCell")) {
      if (currentProblemEl) {
        problemElements.push(currentProblemEl);
      }

      currentProblemEl = {
        problemText: div,
        solutions: [],
      };
    } else if (div.classList.contains("jp-CodeCell")) {
      currentProblemEl!.solutions.push(div);
    }

    if (i === divs.length - 1 && currentProblemEl) {
      problemElements.push(currentProblemEl);
    }
  });

  return problemElements;
}

function parseProblems(problemElements: ProblemElement[]) {
  const problems = problemElements.map((element, i): Problem => {
    return {
      no: i + 1,
      text: element.problemText.textContent.trim(),
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
   * 1 ~ 74問まで対応させる
   */
  return problems.slice(0, 74);
}

async function writeProblemFiles(problems: Problem[]) {
  const promisesToWriteProblems = problems.map(async (problem, index) => {
    const problemNo = index + 1;

    const problemPath = getProblemPath(problemNo);
    const problemDir = join(problemPath, "..");
    await Deno.mkdir(problemDir, { recursive: true });

    // 問題文ファイルの生成
    await Deno.writeTextFile(problemPath, `/*\n  ${problem.text}\n*/`);

    // 期待するテーブルファイルの生成
    await Promise.all(
      problem.solutions.map((solution) => {
        return writeExpectedResults({
          problemNo,
          solutionNo: solution.no,
          result: parseCsv(solution.expectedCsv),
        });
      })
    );
  });

  await Promise.all(promisesToWriteProblems);
}

async function writeAllProblemFile(problems: Problem[]) {
  await Deno.writeTextFile(getAllProblemsPath(), JSON.stringify(problems));
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
