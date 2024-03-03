import { Dayjs } from "dayjs";

export abstract class Parser {
	abstract parse(text: string): Dayjs[];

	toString(): string {
		return `${this.constructor.name}{}`;
	}
}
