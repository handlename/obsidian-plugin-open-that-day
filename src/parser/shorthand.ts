import dayjs, { Dayjs } from "dayjs";
import { Parser } from "../parser";

export class ShorthandParser extends Parser {
	private static patternToday = new RegExp('^t$');
	private static patternRelative = new RegExp('^(?<num>[0-9]+)?(?<unit>[dwm])?(?<direction>[np])?$');

	private static manipulateTypeMap: { [key: string]: string } = {
		d: 'd',
		w: 'w',
		m: 'M',
	} as const;

	parse(text: string): Dayjs[] {
		const funcs = [
			ShorthandParser.parseToday,
			ShorthandParser.parseRelative,
		];

		for (let func of funcs) {
			const days = func(text);

			if (0 < days.length) {
				return days;
			}
		}

		return [];
	}

	static parseToday(text: string): Dayjs[] {
		if (ShorthandParser.patternToday.exec(text) === null) {
			return [];
		}

		return [dayjs()];
	}

	static parseRelative(text: string): Dayjs[] {
		const matched = ShorthandParser.patternRelative.exec(text);
		if (matched === null || matched.groups === undefined) {
			return [];
		}

		const direction = matched.groups['direction'] || 'n';
		const unit = (ShorthandParser.manipulateTypeMap[matched.groups['unit']] || 'd') as dayjs.ManipulateType;
		const num = matched.groups['num'] ? parseInt(matched.groups['num']) : 1;

		const now = dayjs();
		const fn = direction === 'n' ? now.add : now.subtract;

		return [fn.apply(now, [num, unit])];
	}
}
