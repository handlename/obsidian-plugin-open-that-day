import dayjs, { Dayjs } from "dayjs";
import { Success } from "./result";
import { Locale } from './parser/localed';
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

	it('is invalid basic parser type', () => {
		const result = ParserFactory.build([{ category: "basic", name: "foo" }]);
		expect(result.isFailure()).toBeTruthy();
		result.isFailure() && expect(result.error.message).toMatch(/not exists in catalog/);
	});

	describe('parse patterns', () => {

		const patterns: {
			args: [string[], Locale[]],
			text: string,
			days: dayjs.Dayjs[],
		}[] = [
				{
					args: [[], ["en"]],
					text: "Today",
					days: [today]
				},
				{
					args: [[], ["en"]],
					text: "3 weeks later",
					days: [today.add(3, "w")]
				},
				{
					args: [[], ["ja"]],
					text: "昨日",
					days: [today.subtract(1, "d")]
				},
				{
					args: [[], ["ja"]],
					text: "明日",
					days: [today.add(1, "d")]
				},
				{
					args: [[], ["en", "ja"]],
					text: "昨日",
					days: [today.subtract(1, "d")]
				},
				{
					args: [[], ["en", "ja"]],
					text: "Tomorrow",
					days: [today.add(1, "d")]
				},
			];

		describe.each(patterns)("in locales %p, success parse '%s'", ({ args, text, days }) => {
			const buildResult = ParserFactory.build(args[1].map((loc) => {
				return { category: "localed", name: loc };
			}));

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
});
