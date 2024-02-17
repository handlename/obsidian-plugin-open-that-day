import dayjs, { Dayjs } from "dayjs";
import { Parser } from "./parser";

describe('parse', () => {
	beforeEach(() => {
		const epoch = new Date().getTime();
		Date.now = jest.fn(() => epoch);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const now = dayjs();
	const today = dayjs(now.format("YYYY-MM-DD"));

	test("invalid locale", () => {
		const parser = new Parser(["foo"]);
		expect(parser.localedParsers.length).toBe(0);
	});

	describe.each([
		["Today", today],
		["3 weeks later", today.add(3, "w")]
	])("locale = [en], parse '%s' as '%s", (word: string, date: Dayjs) => {
		// test("check", () => {
		const parser = new Parser(["en"]);
		const res = parser.parse(word);

		it("should returns 1 result", () => {
			expect(res.length).toBe(1);
		});

		it(`should be parsed to ${date.format()}`, () => {
			expect(res[0].format()).toBe(date.format());
		})
		// });
	});

	describe.each([
		["昨日", today.subtract(1, "d")],
		["明日", today.add(1, "d")],
	])("locale = [ja], parse '%s' as '%s'", (word: string, date: Dayjs) => {
		const parser = new Parser(["ja"]);
		const res = parser.parse(word);

		it("should returns 1 result", () => {
			expect(res.length).toBe(1);
		});

		it(`should be parsed to ${date.format()}`, () => {
			expect(res[0].format()).toBe(date.format());
		});
	});

	describe.each([
		["昨日", today.subtract(1, "d")],
		["Tomorrow", today.add(1, "d")],
	])("locale = [en, ja], parse '%s' as '%s'", (word: string, date: Dayjs) => {
		const parser = new Parser(["en", "ja"]);
		const res = parser.parse(word);

		it("should returns 1 result", () => {
			expect(res.length).toBe(1);
		});

		it(`should be parsed to ${date.format()}`, () => {
			expect(res[0].format()).toBe(date.format());
		});
	});
});
