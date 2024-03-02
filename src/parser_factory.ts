import { Result, Success, Failure } from "./result";
import { Parser, } from "./parser";
import { ShorthandParser } from "./parser/shorthand";
import { LocaledParser } from "./parser/localed";
import { MultipleParser } from "./parser/multiple";

export class ParserFactory {
	static build(basics: string[], locales: string[]): Result<Parser, Error> {
		const parsers: Parser[] = [];

		const basicParsersResult = this.buildBasicParsers(basics);
		if (basicParsersResult.isSuccess()) {
			parsers.push(...basicParsersResult.value);
		} else {
			return new Failure(basicParsersResult.error);
		}

		const localedParserResult = this.buildLocaledParsers(locales);
		if (localedParserResult.isSuccess()) {
			parsers.push(...localedParserResult.value);
		} else {
			return new Failure(localedParserResult.error);
		}

		return new Success(new MultipleParser(parsers));
	}

	static buildBasicParsers(types: string[]): Result<Parser[], Error> {
		const unknownTypes: string[] = [];

		const parsers = types.flatMap((type) => {
			if (type === 'shorthand') {
				return [new ShorthandParser()];
			}

			unknownTypes.push(type);

			return [];
		});

		if (0 < unknownTypes.length) {
			return new Failure(new Error(`unknown basic parser type received: ${types.join(', ')}`));
		}

		return new Success(parsers);
	};

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
