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
		["n3", [today.add(3, "d")]],

		// p = previous day(s)
		["p", [today.subtract(1, "d")]],
		["p4", [today.subtract(4, "d")]],

		// d = day(s)
		["nd2", [today.add(2, "d")]],
		["pd4", [today.subtract(4, "d")]],

		// w = week(s)
		["nw", [today.add(1, "w")]],
		["pw3", [today.subtract(3, "w")]],

		// m = month(s)
		["nm", [today.add(1, "M")]],
		["pm6", [today.subtract(6, "M")]],

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
