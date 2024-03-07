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

export const ParserCategories = [
	"basic",
	"localed",
] as const;

export type ParserCategory = (typeof ParserCategories)[number];

type ParserCatalogItem = {
	category: ParserCategory,
	name: string,
	class: typeof Parser,
};

export const ParserCatalog: ParserCatalogItem[] = [
	{ category: "basic", name: "shorthand", class: ShorthandParser },

	{ category: "localed", name: "de", class: DeLocaledParser },
	{ category: "localed", name: "en", class: EnLocaledParser },
	{ category: "localed", name: "es", class: EsLocaledParser },
	{ category: "localed", name: "fr", class: FrLocaledParser },
	{ category: "localed", name: "ja", class: JaLocaledParser },
	{ category: "localed", name: "nl", class: NlLocaledParser },
	{ category: "localed", name: "pt", class: PtLocaledParser },
	{ category: "localed", name: "ru", class: RuLocaledParser },
	{ category: "localed", name: "uk", class: UkLocaledParser },
	{ category: "localed", name: "zh", class: ZhLocaledParser },
];

export type ParserSelection = {
	category: string,
	name: string,
};

export class ParserFactory {
	static build(parserSelections: ParserSelection[]): Result<Parser, Error> {
		const parsers: Parser[] = [];

		try {
			parserSelections.forEach((s) => {
				const item = ParserCatalog.find((item) => {
					return item.name === s.name;
				});

				if (item === undefined) {
					throw new Error(`${s} is not exists in catalog`);
				}

				parsers.push(new item.class());
			});
		} catch (e) {
			return new Failure(e);
		};

		return new Success(new MultipleParser(parsers));
	}
}
