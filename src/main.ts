import {
	App,
	Plugin,
	SuggestModal,
	Setting,
	PluginSettingTab,
} from 'obsidian';

import {
	createDailyNote,
	getDailyNote,
	getDailyNoteSettings,
} from 'obsidian-daily-notes-interface';

import moment from 'moment';
import { Parser } from './parser';

const PLUGIN_PREFIX = "open-that-day-";

const LOCALES = [
	"de",
	"en",
	"es",
	"fr",
	"ja",
	"nl",
	"pt",
	"ru",
	"uk",
	"zh",
];

interface ThatDaySettings {
};

export default class OpenThatDayPlugin extends Plugin {
	settings: ThatDaySettings;

	async onload() {
		this.addCommand({
			id: OpenThatDayPlugin.prefixed("open"),
			name: "Open",
			callback: () => {
				new ThatDayModal(this.app).open();
			}
		})

		this.addSettingTab(new ThatDaySettingTab(this.app, this));
	}

	static prefixed(text: string): string {
		return `${PLUGIN_PREFIX}${text}`;
	}

	async loadSettings() {
		this.settings = {}; // TODO:
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
};

class ThatDayModal extends SuggestModal<string> {
	readonly parser: Parser;

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

class ThatDaySettingTab extends PluginSettingTab {
	readonly plugin: OpenThatDayPlugin;

	constructor(app: App, plugin: OpenThatDayPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Locales')
			.setDesc('Toggle localed parsers');

		LOCALES.forEach((loc) => {
			new Setting(containerEl)
				.setName(loc)
				.addToggle((tc) => {
					tc.setValue(
						true // TODO: return value from settings
					).onChange(async (value) => {
						// TODO: set to settings
						await this.plugin.saveSettings();
					});
				});
		});
	}
};
