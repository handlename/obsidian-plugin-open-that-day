import dayjs, { Dayjs } from "dayjs";
import { Success } from "./result";
import { ParserFactory } from "./parser_factory";
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

	it("is invalid locale", () => {
		const result = ParserFactory.build(false, ["foo"]);
		expect(result.isFailure()).toBeTruthy();
		result.isFailure() && expect(result.error.message).toMatch(/unknown locale/);
	});

	describe.each([
		{
			locales: ["en"],
			text: "Today",
			days: [today]
		},
		{
			locales: ["en"],
			text: "3 weeks later",
			days: [today.add(3, "w")]
		},
		{
			locales: ["ja"],
			text: "昨日",
			days: [today.subtract(1, "d")]
		},
		{
			locales: ["ja"],
			text: "明日",
			days: [today.add(1, "d")]
		},
		{
			locales: ["en", "ja"],
			text: "昨日",
			days: [today.subtract(1, "d")]
		},
		{
			locales: ["en", "ja"],
			text: "Tomorrow",
			days: [today.add(1, "d")]
		},
	])("in locales %p, success parse '%s'", ({ locales, text, days }) => {
		const buildResult = ParserFactory.build(false, locales);

		if (buildResult.isFailure()) {
			console.error(buildResult.error);
		}
		expect(buildResult.isSuccess()).toBeTruthy();

		const parser = (buildResult as Success<Parser>).value;
		const results = parser.parse(text);

		it(`should returns ${days.length} result(s)`, () => {
			expect(results.length).toBe(1);
		});

		it.each(
			results.map((r, i) => [r, days[i]])
		)('result %s should be %s', (result: Dayjs, expected: Dayjs) => {
			expect(result.format()).toBe(expected.format());
		});
	});
});
