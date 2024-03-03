import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import { Parser } from "../parser";

export interface LocaledParserFn {
	(text: string, ref?: chrono.ParsingReference | Date, option?: chrono.ParsingOption): chrono.ParsedResult[];
}

export class LocaledParser extends Parser {
	readonly locale: string;
	readonly parserFn: LocaledParserFn;

	constructor(locale: string) {
		super();

		this.locale = locale;

		switch (locale) {
			case "de": this.parserFn = chrono.de.parse; break;
			case "en": this.parserFn = chrono.en.parse; break;
			case "es": this.parserFn = chrono.es.parse; break;
			case "fr": this.parserFn = chrono.fr.parse; break;
			case "ja": this.parserFn = chrono.ja.parse; break;
			case "nl": this.parserFn = chrono.nl.parse; break;
			case "pt": this.parserFn = chrono.pt.parse; break;
			case "ru": this.parserFn = chrono.ru.parse; break;
			case "uk": this.parserFn = chrono.uk.parse; break;
			case "zh": this.parserFn = chrono.zh.parse; break;
			default:
				throw new Error(`unknown locale "${locale}"`);
		}
	};

	parse(text: string): Dayjs[] {
		return this.parserFn(text).map((result) => {
			const at = dayjs(result.date());
			return dayjs(at.format("YYYY-MM-DD"));
		});
	}

	toString(): string {
		return `${this.constructor.name}{locale: ${this.locale}}`;
	}
}
