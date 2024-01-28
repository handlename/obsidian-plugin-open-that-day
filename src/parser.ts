import * as chrono from "chrono-node";
import * as dayjs from "dayjs";

export class Parser {
	locale: string;

	constructor(locale = window.moment.locale()) {
		this.locale = locale;
	}

	parse(text: string): dayjs.Dayjs | undefined {
		const results = ((t) => {
			switch (this.locale) {
				case "ja":
					return chrono.ja.parse(t);
				case "en":
				default:
					return chrono.en.parse(t);
			}
		})(text);

		if (results.length === 0) {
			console.error(`failed to parse text "${text}" as date`);
			return undefined;
		}

		return dayjs(results[0].date());
	}
}
