const Parsers = [
	"shorthand",
] as const;

export type Parser = (typeof Parsers)[number];
