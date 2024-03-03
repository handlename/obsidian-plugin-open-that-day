# Obsidian Plugin: Open That Day

Open daily note by natural language.

![](/doc/demo.gif)

## How to use

1. Run command `Open That Day: Open`
2. Input day expression like "tomorrow" / "next mon" to suggest dialogue
3. Hit `Enter` if suggested date is that day

## Installation

Please use [BRAT](https://github.com/TfTHacker/obsidian42-brat?tab=readme-ov-file)

In Obsidian app, run command `BRAT: Plugins: Add a plugin with frozen version based on a release tag`, then input:

- Repository: `handlename/obsidian-plugin-open-that-day`
- Version: `v0.1.1`

and click `Add Plugin` button.

## Parsers

The plugin supports multiple parsers.
You can toggle each parsers at plugin settings.

### Shorthand Parser

Shorthand Parser parses short keyword to fixed date.

- format: `[direction][unit][number]`
    - directon: default=`n`
        - `n` (next)
        - `l` (later)
        - `b` (before)
        - `p` (previous)
        - `a` (after, ago)
    - unit: default=`d`
        - `d` (day)
        - `w` (week)
        - `m` (month)
        - `y` (year)
    - number: default=`1`
        - any fixed number
- examples:
    - `n` → `next day`
    - `4` → `4 days later`
    - `3wb` → `3 weeks before`
    - `2ml` → `2 months later`
    - `-1y` → `-1 year later` = `1 year before`

### Localed Parsers

Using [chrono-node](https://www.npmjs.com/package/chrono-node), parses natural language date expression to fixed date.
For more detail, please check [source code](https://github.com/wanasit/chrono/tree/master/src/locales) of chrono-node.

- examples:
    - `en`: `today` `tomorrow` `next mon`
    - `ja`: `今日` `明日`
    - ...

## License

[MIT](https://github.com/handlename/obsidian-plugin-open-that-day/blob/main/LICENSE)

## Author

[@handlename](https://github.com/handlename)
