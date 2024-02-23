import { Result, Success, Failure } from "./result";
import { Parser, } from "./parser";
import { ShorthandParser } from "./parser/shorthand";
import { LocaledParser } from "./parser/localed";
import { MultipleParser } from "./parser/multiple";

export class ParserFactory {
	static build(includeCustom: boolean, locales: string[]): Result<Parser, Error> {
		const parsers: Parser[] = [];

		if (includeCustom) {
			parsers.push(new ShorthandParser());
		}

		const localedParserResult = this.buildLocaledParsers(locales);
		if (localedParserResult.isSuccess()) {
			parsers.push(...localedParserResult.value);
		} else {
			return new Failure(localedParserResult.error);
		}

		return new Success(new MultipleParser(parsers));
	}

	static buildLocaledParsers(locales: string[]): Result<LocaledParser[], Error> {
		const parsers: LocaledParser[] = [];
		let failure: Failure<Error> | undefined;

		locales.forEach((loc) => {
			try {
				const parser = new LocaledParser(loc);
				parsers.push(parser);
			} catch (e) {
				failure = new Failure(e);
				return;
			}
		});

		if (failure !== undefined) {
			return failure;
		}

		return new Success(parsers);
	}
}
