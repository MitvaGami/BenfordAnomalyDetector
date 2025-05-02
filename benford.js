exports.analyze = function (numbers) {
  const total = numbers.length;
  const frequencies = Array(9).fill(0);
  numbers.forEach((num) => {
    const firstDigit = parseInt(String(Math.abs(num))[0]);
    if (firstDigit >= 1 && firstDigit <= 9) frequencies[firstDigit - 1]++;
  });
  const actual = frequencies.map((f) => f / total);
  const expected = Array.from({ length: 9 }, (_, i) =>
    Math.log10(1 + 1 / (i + 1))
  );
  const anomalies = actual.map((val, i) => ({
    digit: i + 1,
    actual: val,
    expected: expected[i],
    deviation: Math.abs(val - expected[i]),
  }));
  return { actual, expected, anomalies };
};
