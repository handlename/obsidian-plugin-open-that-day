import * as chrono from "chrono-node";
import dayjs from "dayjs";

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
			console.debug(`failed to parse text "${text}" as date`);
			return undefined;
		}

		return dayjs(results[0].date());
	}
}
