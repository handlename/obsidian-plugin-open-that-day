import {
	App,
	Plugin,
	Modal,
} from 'obsidian';

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

class ThatDayModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Open That Day');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
};
