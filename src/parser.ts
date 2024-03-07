import { Dayjs } from "dayjs";

export class Parser {
	parse(text: string): Dayjs[] {
		throw new Error("must be override");
	};

	toString(): string {
		return `${this.constructor.name}{}`;
	}
}
