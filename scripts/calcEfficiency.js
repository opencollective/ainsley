// from https://almanac.httparchive.org/en/2019/compression
const data = {
  //  [min, gzip, brotli]
  js: [
    10_467_783 + 12_186_420,
    36_181_787 + 43_073_318,
    8_967_497 + 10_173_063
  ],
  css: [7_199_054 + 8_560_550, 24_289_658 + 28_333_663, 8_313_337 + 9_908_650]
};

const cssWeightedAverage = ([min, gz, br]) => {
  const total = data.css.reduce((a, b) => a + b);
  const ratios = data.css.map(n => n / total);
  return [min, gz, br].reduce((total, next, i) => total + next * ratios[i], 0);
};

const jsWeightedAverage = ([min, gz, br]) => {
  const total = data.js.reduce((a, b) => a + b);
  const ratios = data.js.map(n => n / total);
  return [min, gz, br].reduce((total, next, i) => total + next * ratios[i], 0);
};

const calculateEfficiency = (
  min,
  gz,
  br,
  rules,
  js = true,
  name = "ainsley"
) => {
  const fn = js ? jsWeightedAverage : cssWeightedAverage;
  const efficiency = rules / fn([min, gz, br]);
  return efficiency;
};

// console.log(
//   calculateEfficiency(710997, 97417, 10199, 14445, false, "tailwindcss")
// );
// console.log(calculateEfficiency(73497, 13697, 2421, 2113, false, "tachyons"));
// console.log(
//   calculateEfficiency(49793, 9200, 1957, 1278, false, "sane-tachyons")
// );
// console.log(calculateEfficiency(93542, 17025, 4311, 1588, false, "turretcss"));
// console.log(calculateEfficiency(82482, 12585, 2497, 1469, false, "solid"));
// console.log(calculateEfficiency(11326, 2477, 589, 260, false, "basscss"));
// console.log(calculateEfficiency(159515, 23681, 4762, 2027, false, "bootstrap"));
// console.log(calculateEfficiency(194420, 25511, 5705, 2142, false, "bulma"));
// console.log(
//   calculateEfficiency(141841, 21558, 5579, 1609, false, "materialize")
// );
// console.log(calculateEfficiency(45964, 9631, 1992, 638, false, "spectre"));
// console.log(
//   calculateEfficiency(132474, 17219, 3471, 1420, false, "foundation")
// );
// console.log(calculateEfficiency(8718, 2295, 442, 90, false, "milligram"));
// console.log(calculateEfficiency(5879, 1630, 356, 84, false, "skeleton"));

// console.log(calculateEfficiency(5292, 2341, 2069, 21720));

module.exports = calculateEfficiency;
