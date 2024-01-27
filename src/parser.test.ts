import * as dayjs from "dayjs";
import { Parser } from "./parser";

test("basic", () => {
	const now = new Date();
	const spy = jest.spyOn(global, 'Date').mockImplementation(() => now);
	const nowjs = dayjs();

	const parser = new Parser("en");
	expect(parser.parseAsDate("Today").format()).toBe(nowjs.format());
	expect(parser.parseAsDate("3 weeks later").format()).toBe(nowjs.add(3, "w").format());
});
