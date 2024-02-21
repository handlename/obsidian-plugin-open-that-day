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
] as const;

interface ThatDaySettings {
	locales: string[];
};

const DEFAULT_SETTIGNS: Partial<ThatDaySettings> = {
	locales: ["en"],
};

export default class OpenThatDayPlugin extends Plugin {
	settings: ThatDaySettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: OpenThatDayPlugin.prefixed("open"),
			name: "Open",
			callback: () => {
				new ThatDayModal(this.app, this).open();
			}
		})

		this.addSettingTab(new ThatDaySettingTab(this.app, this));
	}

	static prefixed(text: string): string {
		return `${PLUGIN_PREFIX}${text}`;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTIGNS, await this.loadData());
	}

	async saveSettings() {
		console.debug(this.settings);
		await this.saveData(this.settings);
	}
};

class ThatDayModal extends SuggestModal<string> {
	readonly parser: Parser;

	constructor(app: App, plugin: OpenThatDayPlugin) {
		super(app);
		this.parser = new Parser(plugin.settings.locales);
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
	readonly localeClassName = "locale";
	enabledLocales = new Map<string, boolean>;

	constructor(app: App, plugin: OpenThatDayPlugin) {
		super(app, plugin);
		this.plugin = plugin;

		LOCALES.forEach((loc) => {
			this.enabledLocales.set(loc, plugin.settings.locales.includes(loc));
		});
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
				.setClass(this.localeClassName)
				.addToggle((tc) => {
					tc.setValue(
						!!this.enabledLocales.get(loc)
					).onChange(async (value) => {
						this.enabledLocales.set(loc, value);
						this.plugin.settings.locales = LOCALES.filter((loc) => !!this.enabledLocales.get(loc));
						await this.plugin.saveSettings();
					});
				});
		});
	}
};
