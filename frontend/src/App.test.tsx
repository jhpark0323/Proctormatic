test("각 원소의 제곱을 반환", () => {
  const input = [1, 2, 3]
  const result = input.map((e) => (e * e));

  expect(result).toEqual([1, 4, 9])
})