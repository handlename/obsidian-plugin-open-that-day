import { ParserCatalog } from "./parser_factory";

describe("validate ParserCatalog", () => {
	it("has unique names", () => {
		const names = ParserCatalog.map((item) => item.name);
		expect(names.length).toEqual([...new Set(names)].length);
	})

	it("has unique classes", () => {
		const classes = ParserCatalog.map((item) => item.class);
		expect(classes.length).toEqual([...new Set(classes)].length);
	})
});
