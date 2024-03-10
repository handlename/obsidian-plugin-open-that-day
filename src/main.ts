import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	SuggestModal,
} from 'obsidian';

import markdoc from '@markdoc/markdoc';
import moment from 'moment';
import {
	createDailyNote,
	getDailyNoteSettings,
} from 'obsidian-daily-notes-interface';

import { Parser } from './parser';
import {
	ParserCatalog,
	ParserFactory,
	ParserName,
} from './parser_factory';

const PLUGIN_PREFIX = "open-that-day-";

type ThatDaySettings = {
	parsers: ParserName[];
};

const DEFAULT_SETTIGNS: Partial<ThatDaySettings> = {
	parsers: ["shorthand", "en"],
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

		const result = ParserFactory.build(plugin.settings.parsers);
		if (result.isFailure()) {
			throw new Error("failed to build Parser");
		}

		this.parser = result.value;
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
	enabledParsers = new Set<ParserName>;

	constructor(app: App, plugin: OpenThatDayPlugin) {
		super(app, plugin);
		this.plugin = plugin;

		plugin.settings.parsers.forEach((name) => {
			this.setEnabled(name, true);
		});
		console.debug(this.enabledParsers);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const keys = Object.keys(ParserCatalog);
		ParserCatalog.forEach((item) => {
			new Setting(containerEl)
				.setName(item.name)
				.setDesc((() => {
					const ast = markdoc.parse(item.class.description);
					const content = markdoc.transform(ast);
					const md = markdoc.renderers.html(content);

					const div = document.createElement("div");
					div.innerHTML = md;

					const df = document.createDocumentFragment();
					df.append(div);

					return df;
				})())
				.addToggle((tc) => {
					tc.setValue(
						this.isEnabled(item.name)
					).onChange(async (value) => {
						await this.onChangeParserToggle(item.name, value);
					});
				});
		});
	}

	async onChangeParserToggle(name: ParserName, value: boolean) {
		this.setEnabled(name, value);

		this.plugin.settings.parsers = [...this.enabledParsers];
		await this.plugin.saveSettings();
	}

	isEnabled(name: ParserName): boolean {
		return this.enabledParsers.has(name);
	}

	setEnabled(name: ParserName, value: boolean) {
		if (value) {
			this.enabledParsers.add(name);
		} else {
			this.enabledParsers.delete(name);
		}
	}
};
