import * as chrono from "chrono-node";
import * as dayjs from "dayjs";

interface ParserFn {
	(text: string, ref?: chrono.ParsingReference | Date, option?: chrono.ParsingOption): chrono.ParsedResult[];
}

export class Parser {
	locale: string;

	constructor(locale = window.moment.locale()) {
		this.locale = locale;
	}

	localedParser(): ParserFn {
		switch (this.locale) {
			case "ja":
				return chrono.ja.parse;
			case "en":
				return chrono.en.parse;
			default:
				console.info(`unknown locale "${this.locale}". fallback to "en"`);
				return chrono.en.parse;
		}
	}

	parse(text: string): dayjs.Dayjs | undefined {
		const parser = this.localedParser();
		const results = parser(text);

		if (results.length === 0) {
			console.error(`failed to parse text "${text}" as date`);
			return undefined;
		}

		return dayjs(results[0].date());
	}
}
