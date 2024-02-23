import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";

type Result<T, E extends Error> = Success<T> | Failure<E>

class Success<T> {
	readonly value: T;

	constructor(value: T) {
		this.value = value;
	}

	isSuccess(): this is Success<T> {
		return true;
	}

	isFailure(): this is Failure<Error> {
		return false;
	}
}

class Failure<E extends Error> {
	readonly error: E;

	constructor(error: E) {
		this.error = error;
	}

	isSuccess(): this is Success<unknown> {
		return false;
	}

	isFailure(): this is Failure<E> {
		return true;
	}
}

interface ParserFn {
	(text: string, ref?: chrono.ParsingReference | Date, option?: chrono.ParsingOption): chrono.ParsedResult[];
}

class LocaledParser {
	constructor(
		readonly locale: string,
		readonly parse: ParserFn,
	) { }
}

export class Parser {
	readonly localedParsers: LocaledParser[];

	constructor(locales = [window.moment.locale()]) {
		this.localedParsers = [];

		locales.forEach((loc) => {
			const result = this.localedParser(loc);

			if (result.isSuccess()) {
				this.localedParsers.push(new LocaledParser(loc, result.value));
			} else {
				console.warn(`failed to select parser: ${result.error}`);
			}
		});
	}

	localedParser(loc: string): Result<ParserFn, Error> {
		switch (loc) {
			case "de":
				return new Success<ParserFn>(chrono.de.parse);
			case "en":
				return new Success<ParserFn>(chrono.en.parse);
			case "es":
				return new Success<ParserFn>(chrono.es.parse);
			case "fr":
				return new Success<ParserFn>(chrono.fr.parse);
			case "ja":
				return new Success<ParserFn>(chrono.ja.parse);
			case "nl":
				return new Success<ParserFn>(chrono.nl.parse);
			case "pt":
				return new Success<ParserFn>(chrono.pt.parse);
			case "ru":
				return new Success<ParserFn>(chrono.ru.parse);
			case "uk":
				return new Success<ParserFn>(chrono.uk.parse);
			case "zh":
				return new Success<ParserFn>(chrono.zh.parse);
			default:
				return new Failure<Error>(new Error(`unknown locale "${loc}"`))
		}
	}

	parse(text: string): dayjs.Dayjs[] {
		const dates: Dayjs[] = [];

		this.localedParsers.forEach((parser) => {
			const results = parser.parse(text);

			if (results.length === 0) {
				console.debug(`failed to parse text '${text}' for locale '${parser.locale}'`)
				return;
			}

			results.forEach((result) => {
				const at = dayjs(result.date());
				dates.push(dayjs(at.format("YYYY-MM-DD")));
			});
		});

		return dates;
	}
}
