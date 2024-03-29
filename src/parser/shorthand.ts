import dayjs, { Dayjs } from "dayjs";
import { Parser } from "../parser";

const Directions = [-1, 1] as const;
type Direction = (typeof Directions)[number];

export class ShorthandParser extends Parser {
	static description = `
Parses shorthand expression, specifis related to current date.

#### Format

\`\`\`
[direction][unit][number]
\`\`\`

- directon
	- \`n\` (next) default
	- \`l\` (later)
	- \`b\` (before)
	- \`p\` (previous)
	- \`a\` (after, ago)
- unit
	- \`d\` (day) default
	- \`w\` (week)
	- \`m\` (month)
	- \`y\` (year)
- number
	- any fixed number, default=1

#### Examples

- \`n\` → next day
- \`4\` → 4 days later
- \`3wb\` → 3 weeks before
- \`2ml\` → 2 months later
- \`-1y\` → -1 year later = 1 year before
	`;

	private static patternToday = new RegExp('^t$');
	private static patternRelative = new RegExp('^(?<num>[-0-9]+)?(?<unit>[dwmy])?(?<direction>[ablnp])?$');

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

		const parseResult = {
			direction: matched.groups['direction'] ?? "n",
			unit: matched.groups['unit'] ?? "d",
			num: matched.groups['num'] ? parseInt(matched.groups['num']) : 1,
		};

		const now = dayjs();
		const directions = ShorthandParser.determineDirection(parseResult.direction);
		const unit = ShorthandParser.determineUnit(parseResult.unit);

		return directions.map((d) => {
			return now.add(parseResult.num * d, unit)
		});
	}

	static determineDirection(ch: string): Direction[] {
		switch (ch) {
			case "a":
				return [1, -1];
			case "b":
			case "p":
				return [-1];
			case "l":
			case "n":
				return [1];
		}

		return [];
	}

	static determineUnit(ch: string): dayjs.ManipulateType {
		switch (ch) {
			case "d": return "d";
			case "w": return "w";
			case "m": return "M";
			case "y": return "y";
		}

		return "d";
	}
}
