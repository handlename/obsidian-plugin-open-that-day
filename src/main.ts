import {
	App,
	Plugin,
	SuggestModal,
	Setting,
} from 'obsidian';

import {
	createDailyNote,
	getDailyNote,
	getDailyNoteSettings,
} from 'obsidian-daily-notes-interface';

import moment from 'moment';
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
		this.parser = new Parser(["en", "ja"]);
	}

	getSuggestions(query: string): string[] {
		const days = this.parser.parse(query);
		return days.map((day) => day.format("YYYY-MM-DD"));
	}

	renderSuggestion(date: string, el: HTMLElement) {
		el.createEl("div", { text: date });
	}

	async onChooseSuggestion(text: string, event: MouseEvent | KeyboardEvent) {
		console.debug(`choosed "${text}"`);

		const settings = getDailyNoteSettings()
		console.debug(settings);

		const day = moment(text);

		let file = this.app.metadataCache.getFirstLinkpathDest(day.format(settings.format), settings.folder || "")
		if (file === null) {
			console.debug("create daily note");
			file = await createDailyNote(day);
		}

		if (file === null) {
			console.debug("failed to open or create daily note");
			return;
		}

		console.debug(`file to open: ${file}`);

		const leaf = this.app.workspace.getLeaf();
		leaf.openFile(file);
	}
};
