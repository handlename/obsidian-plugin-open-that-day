import dayjs, { Dayjs } from "dayjs";
import {
	Parser,
} from "../parser";


export class MultipleParser extends Parser {
	readonly localedParsers: Parser[];

	constructor(parsers: Parser[]) {
		super();
		this.localedParsers = parsers;
	}

	parse(text: string): dayjs.Dayjs[] {
		const dates: Dayjs[] = [];

		this.localedParsers.forEach((parser) => {
			const results = parser.parse(text);

			if (results.length === 0) {
				console.debug(`failed to parse text '${text}' for parser '${parser}'`)
				return;
			}

			dates.push(...results);
		});

		return dates;
	}
}
