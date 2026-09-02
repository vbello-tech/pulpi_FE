// Classic homiletical outline numbering: I. / A. / 1. / a. / then repeats the last scheme.
function toRoman(num) {
  const map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let result = "";
  for (const [value, symbol] of map) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

const SCHEMES = [
  (i) => toRoman(i + 1) + ".",
  (i) => String.fromCharCode(65 + (i % 26)) + ".",
  (i) => (i + 1) + ".",
  (i) => String.fromCharCode(97 + (i % 26)) + ".",
];

export function outlineMarker(depth, index) {
  const scheme = SCHEMES[Math.min(depth, SCHEMES.length - 1)];
  return scheme(index);
}
