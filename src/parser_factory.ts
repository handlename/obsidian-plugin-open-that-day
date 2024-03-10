import { Result, Success, Failure } from "./result";
import { Parser, } from "./parser";
import { ShorthandParser } from "./parser/shorthand";
import {
	DeLocaledParser,
	EnLocaledParser,
	EsLocaledParser,
	FrLocaledParser,
	JaLocaledParser,
	NlLocaledParser,
	PtLocaledParser,
	RuLocaledParser,
	UkLocaledParser,
	ZhLocaledParser,
} from "./parser/localed";
import { MultipleParser } from "./parser/multiple";

export const ParserCatalog = [
	{ name: "shorthand", class: ShorthandParser },

	{ name: "de", class: DeLocaledParser },
	{ name: "en", class: EnLocaledParser },
	{ name: "es", class: EsLocaledParser },
	{ name: "fr", class: FrLocaledParser },
	{ name: "ja", class: JaLocaledParser },
	{ name: "nl", class: NlLocaledParser },
	{ name: "pt", class: PtLocaledParser },
	{ name: "ru", class: RuLocaledParser },
	{ name: "uk", class: UkLocaledParser },
	{ name: "zh", class: ZhLocaledParser },
] as const;

export type ParserName = (typeof ParserCatalog)[number]["name"];

export class ParserFactory {
	static build(names: ParserName[]): Result<Parser, Error> {
		const parsers: Parser[] = [];

		try {
			names.forEach((name) => {
				const item = ParserCatalog.find((item) => item.name === name);

				if (item === undefined) {
					throw new Error(`invalid parser name: ${name}`);
				}

				parsers.push(new item.class());
			});
		} catch (e) {
			return new Failure(e);
		};

		return new Success(new MultipleParser(parsers));
	}
}
