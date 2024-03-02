import dayjs, { Dayjs } from "dayjs";
import { ShorthandParser } from "./shorthand"

describe("ShorthandParser", () => {
	beforeAll(() => {
		const epoch = new Date().getTime();
		Date.now = jest.fn(() => epoch);
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const today = dayjs();
	const parser = new ShorthandParser();

	describe.each([
		// t = today
		["t", [today]],

		// n = next day(s)
		["n", [today.add(1, "d")]],
		["3n", [today.add(3, "d")]],

		// l = day(s) later
		["l", [today.add(1, "d")]],
		["4l", [today.add(4, "d")]],

		// p = previous day(s)
		["p", [today.subtract(1, "d")]],
		["4p", [today.subtract(4, "d")]],

		// b = day(s) before
		["b", [today.subtract(1, "d")]],
		["2b", [today.subtract(2, "d")]],

		// a = day(s) ago or after
		["a", [today.add(1, "d"), today.subtract(1, "d")]],
		["3a", [today.add(3, "d"), today.subtract(3, "d")]],

		// d = day(s)
		["2d", [today.add(2, "d")]],
		["3dn", [today.add(3, "d")]],
		["4dp", [today.subtract(4, "d")]],

		// w = week(s)
		["w", [today.add(1, "w")]],
		["1wn", [today.add(1, "w")]],
		["3wp", [today.subtract(3, "w")]],

		// m = month(s)
		["m", [today.add(1, "M")]],
		["2mn", [today.add(2, "M")]],
		["6mp", [today.subtract(6, "M")]],

		// failed to parse
		["foo", []],
	])("parse %s", (text, expected) => {
		let results: Dayjs[] = [];

		expect(() => {
			results = parser.parse(text);
		}).not.toThrow();
		// const results = parser.parse(keyword);

		it(`should returns ${expected.length}`, () => {
			expect(results.length).toBe(expected.length);
		});

		if (0 < results.length) {
			it.each(
				results.map((r, i) => [r, expected[i]])
			)('result %s should be %s', (r, e) => {
				expect(r.format("YYYY-MM-DD")).toBe(e.format("YYYY-MM-DD"));
			});
		}
	});
});
