import dayjs from "dayjs";
import { Parser } from "./parser";

describe('parse', () => {
	beforeEach(() => {
		const epoch = new Date().getTime();
		Date.now = jest.fn(() => epoch);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("en", () => {
		const now = dayjs();

		const parser = new Parser("en");
		expect(parser.parse("Today")?.format()).toBe(now.format());
		expect(parser.parse("3 weeks later")?.format()).toBe(now.add(3, "w").format());
	});

	test("ja", () => {
		const now = dayjs();

		const parser = new Parser("ja");
		expect(parser.parse("昨日")?.format()).toBe(now.subtract(1, "d").format());
		expect(parser.parse("明日")?.format()).toBe(now.add(1, "d").format());
	});
});
