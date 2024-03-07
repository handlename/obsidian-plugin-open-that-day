import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import { Parser } from "../parser";

export const Locales = [
	"de",
	"en",
	"es",
	"fr",
	"ja",
	"nl",
	"pt",
	"ru",
	"uk",
	"zh",
] as const;

export type Locale = (typeof Locales)[number];

export interface LocaledParserFn {
	(text: string, ref?: chrono.ParsingReference | Date, option?: chrono.ParsingOption): chrono.ParsedResult[];
}

export class LocaledParser extends Parser {
	readonly locale: string;
	readonly parserFn: LocaledParserFn;

	constructor(locale: Locale) {
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

export class DeLocaledParser extends LocaledParser {
	constructor() { super("de") }
}

export class EnLocaledParser extends LocaledParser {
	constructor() { super("en") }
}

export class EsLocaledParser extends LocaledParser {
	constructor() { super("es") }
}

export class FrLocaledParser extends LocaledParser {
	constructor() { super("fr") }
}

export class JaLocaledParser extends LocaledParser {
	constructor() { super("ja") }
}

export class NlLocaledParser extends LocaledParser {
	constructor() { super("nl") }
}

export class PtLocaledParser extends LocaledParser {
	constructor() { super("pt") }
}

export class RuLocaledParser extends LocaledParser {
	constructor() { super("ru") }
}

export class UkLocaledParser extends LocaledParser {
	constructor() { super("uk") }
}

export class ZhLocaledParser extends LocaledParser {
	constructor() { super("zh") }
}

