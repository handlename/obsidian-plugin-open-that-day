import {
	App,
	Plugin,
	SuggestModal,
	Setting,
} from 'obsidian';
import { Parser } from './parser';

const PLUGIN_PREFIX = "open-that-day-";

export default class OpenThatDayPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: OpenThatDayPlugin.prefixed("open"),
			name: "Open",
			callback: () => {
				new ThatDayModal(this.app).open();
			}
		})
	}

	static prefixed(text: string): string {
		return `${PLUGIN_PREFIX}${text}`;
	}
};

class ThatDayModal extends SuggestModal<string> {
	parser: Parser;
	text: string;

	constructor(app: App) {
		super(app);
		this.parser = new Parser();
	}

	getSuggestions(query: string): string[] {
		const day = this.parser.parse(query);

		if (day === undefined) {
			return [];
		}

		return [
			day.format("YYYY-MM-DD"),
		]
	}

	renderSuggestion(date: string, el: HTMLElement) {
		el.createEl("div", { text: date });
	}

	onChooseSuggestion(text: string, event: MouseEvent | KeyboardEvent) {
		console.log(`choosed "${text}"`);
	}
};
