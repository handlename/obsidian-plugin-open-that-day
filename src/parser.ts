import * as chrono from "chrono-node";
import * as dayjs from "dayjs";

export class Parser {
	locale: string;

	constructor(locale = window.moment.locale()) {
		this.locale = locale;
	}

	parse(text: string): chrono.ParsedResult[] {
		switch (this.locale) {
			case "ja":
				return chrono.ja.parse(text);
			case "en":
			default:
				return chrono.en.parse(text);
		}
	}

	parseAsDate(text: string): dayjs.Dayjs {
		// TODO: call parse then ...
		const parsed = this.parse(text);
		console.log(parsed);
		return dayjs();
	}
}
