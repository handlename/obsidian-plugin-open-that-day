import dayjs, { Dayjs } from "dayjs";

import { Parser } from "./parser";
import { ParserFactory, ParserName } from "./parser_factory";
import { Success } from "./result";

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

	describe('parse patterns', () => {

		const patterns: [ParserName[], string, dayjs.Dayjs[]][] = [
			[["en"], "Today", [today]],
			[["en"], "3 weeks later", [today.add(3, "w")]],
			[["ja"], "昨日", [today.subtract(1, "d")]],
			[["ja"], "明日", [today.add(1, "d")]],
			[["ja"], "昨日", [today.subtract(1, "d")]],
			[["en", "ja"], "Tomorrow", [today.add(1, "d")]],
			[["en", "ja"], "明日", [today.add(1, "d")]],
		];

		describe.each(patterns)("in locales %p, success parse '%s'", (args, text, days) => {
			const buildResult = ParserFactory.build(args);

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
