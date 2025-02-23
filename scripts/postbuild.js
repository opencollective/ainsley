const fs = require("fs-extra");
const path = require("path");
const calcStats = require("./calcStats");
const calcEfficiency = require("./calcEfficiency");

const testCoverage = require("../coverage/coverage-summary.json");

const ftNum = n =>
  `${n}`
    .split("")
    .reduceRight(
      (s, c, i, a) =>
        (a.length - i) % 3 === 0 && i > 0 ? `,${c}${s}` : `${c}${s}`,
      ""
    );

(async () => {
  const staticFiles = await fs.readdir(path.join(__dirname, "../src/static"));

  await Promise.all(
    staticFiles.map(file =>
      fs.copy(
        path.join(__dirname, "../src/static", file),
        path.join(__dirname, "../dist", file)
      )
    )
  );

  const stats = await calcStats();

  const vars = {
    j: ftNum(stats.baseConfig.bytes.min).padStart(5, " "),
    c: ftNum(stats.compiler.bytes.min).padStart(9, " "),
    o: ftNum(stats.equiv.bytes.min).padStart(10, " "),
    jg: ftNum(stats.baseConfig.bytes.gz).padStart(5, " "),
    cg: ftNum(stats.compiler.bytes.gz).padStart(9, " "),
    og: ftNum(stats.equiv.bytes.gz).padStart(10, " "),
    jb: ftNum(stats.baseConfig.bytes.br11).padStart(5, " "),
    cb: ftNum(stats.compiler.bytes.br11).padStart(9, " "),
    ob: ftNum(stats.equiv.bytes.br11).padStart(10, " "),
    at: ftNum(stats.baseConfig.bytes.br11 + stats.compiler.bytes.br11).padStart(
      17,
      " "
    ),
    am: `\`${ftNum(stats.baseConfig.bytes.min + stats.compiler.bytes.min)}\``,
    ag: `\`${ftNum(stats.baseConfig.bytes.gz + stats.compiler.bytes.gz)}\``,
    ab: `\`${ftNum(stats.baseConfig.bytes.br11 + stats.compiler.bytes.br11)}\``,
    arc: `\`${ftNum(stats.ruleCount)}\``,
    ae: `\`${calcEfficiency(
      stats.baseConfig.bytes.min + stats.compiler.bytes.min,
      stats.baseConfig.bytes.gz + stats.compiler.bytes.gz,
      stats.baseConfig.bytes.br11 + stats.compiler.bytes.br11,
      stats.ruleCount
    ).toFixed(2)}\``
  };

  fs.writeFileSync(
    path.join(__dirname, "../README.md"),
    "<!-- DO NOT EDIT DIRECTLY! -->\n\n" +
      fs
        .readFileSync(path.join(__dirname, "../README.md.template"), "utf8")
        .replace(/\{\{([a-zA-Z]+)\}\}/g, (_, arg) => vars[arg])
  );
})();
