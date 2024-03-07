import {
	App,
	Plugin,
	SuggestModal,
	Setting,
	PluginSettingTab,
} from 'obsidian';

import {
	createDailyNote, getDailyNoteSettings
} from 'obsidian-daily-notes-interface';

import moment from 'moment';
import { Parser } from './parser';
import { ParserFactory, ParserCategory, ParserSelection, ParserCatalog, ParserCategories } from './parser_factory';
import { Locale, Locales } from './parser/localed';
import { networkInterfaces } from 'os';

const PLUGIN_PREFIX = "open-that-day-";

type ThatDaySettings = {
	parsers: ThatDayParserStting;
};

type ThatDayParserStting = {
	[category in ParserCategory]: string[];
}

const DEFAULT_SETTIGNS: Partial<ThatDaySettings> = {
	parsers: {
		basic: [
			"shorthand",
		],
		localed: [
			"en",
		],
	},
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

		const selections = this.buildParserSelections(plugin.settings.parsers);
		const result = ParserFactory.build(selections);
		if (result.isFailure()) {
			throw new Error("failed to build Parser");
		}

		this.parser = result.value;
	}

	buildParserSelections(setting: ThatDayParserStting): ParserSelection[] {
		return ParserCategories.flatMap((category) => {
			if (setting[category] === undefined) {
				return [];
			}

			return setting[category].map((name) => {
				return { category, name };
			})
		});
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
	enabledParsers = new Map<ParserCategory, Map<string, boolean>>;

	constructor(app: App, plugin: OpenThatDayPlugin) {
		super(app, plugin);
		this.plugin = plugin;

		ParserCategories.forEach((category) => {
			this.enabledParsers.set(category, new Map<string, boolean>);

			plugin.settings.parsers[category].forEach((name) => {
				this.enabledParsers.get(category)?.set(name, true);
			})
		});
		console.debug(this.enabledParsers);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// TODO: generate settings using PareserCatalog

		new Setting(containerEl)
			.setName("Basic Parsers")
			.setDesc("Toggle basic parsers");

		[
			{
				name: "shorthand",
				desc: (() => {
					const d = document.createDocumentFragment();
					d.append(
						createSpan({ text: "specify that day by shorthand expression." }), createEl("br"),
						createEl("br"),
						createSpan({ text: "format: [direction][unit][number]" }), createEl("br"),
						createSpan({ text: "directon := n (next) | l (later) | b (before) | p (previous) | a (after, ago) , default=n" }), createEl("br"),
						createSpan({ text: "unit := d(day) | w(week) | m(month) | y(year), default=d" }), createEl("br"),
						createSpan({ text: "number := any fixed number, default=1" }), createEl("br"),
						createEl("br"),
						createSpan({ text: "example:" }), createEl("br"),
						createSpan({ text: "n → next day" }), createEl("br"),
						createSpan({ text: "4 → 4 days later" }), createEl("br"),
						createSpan({ text: "3wb → 3 weeks before" }), createEl("br"),
						createSpan({ text: "2ml → 2 months later" }), createEl("br"),
						createSpan({ text: "-1y → -1 year later = 1 year before" }),
					);
					return d;
				})(),
			}
		].forEach((type) => {
			new Setting(containerEl)
				.setName(type.name)
				.setDesc(type.desc)
				.addToggle((tc) => {
					tc.setValue(
						this.isEnabled("basic", type.name)
					).onChange(async (value) => {
						await this.onChangeParserToggle("basic", type.name, value);
					});
				});
		});

		new Setting(containerEl)
			.setName('Locales')
			.setDesc('Toggle localed parsers');

		Locales.forEach((loc) => {
			new Setting(containerEl)
				.setName(loc)
				.addToggle((tc) => {
					this.enabledParsers;
					tc.setValue(
						this.isEnabled("localed", loc)
					).onChange(async (value) => {
						await this.onChangeParserToggle("localed", loc, value);
					});
				});
		});
	}

	async onChangeParserToggle(category: ParserCategory, name: string, value: boolean) {
		this.setEnabled(category, name, value);

		const newSetting: ThatDayParserStting = { basic: [], localed: [] };

		ParserCatalog.forEach((item) => {
			if (this.isEnabled(item.category, item.name)) {
				newSetting[item.category].push(item.name);
			}
		})

		this.plugin.settings.parsers = newSetting;
		await this.plugin.saveSettings();
	}

	isEnabled(category: ParserCategory, name: string): boolean {
		return !!this.enabledParsers.get(category)?.get(name);
	}

	setEnabled(category: ParserCategory, name: string, value: boolean) {
		if (!this.enabledParsers.has(category)) {
			this.enabledParsers.set(category, new Map<string, boolean>);
		}

		this.enabledParsers.get(category)?.set(name, value);
	}
};
