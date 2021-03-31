# Line Width Indicator

![LWI Logo](https://i.imgur.com/0cFEWGm.png)

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/lbragile.line-width-indicator?label=Version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=lbragile.line-width-indicator) [![License](https://img.shields.io/github/license/lbragile/Line-Width-Indicator?&label=License&&style=flat-square)](https://github.com/lbragile/Line-Width-Indicator/blob/master/LICENSE.md)

Tired of guessing how many more characters you can type before your formatter decides its time to wrap to the next line? What about those hefty rulers that seem out of place? Wouldn't it be nice to have a visual indicator as you type?

This is exactly what Line Width Indicator does!
It simply places a counter at the end of each line that indicates how many characters you have left before you reach a settings configurable value.

Line Width Indicator is also **Open Source** under **MIT License**. Visit the [repository](https://github.com/lbragile/Line-Width-Indicator) and feel free to contribute!

## Features

Currently the indicator is shown and updates as you type with predefined colors that can be adjusted in the settings. You can also adjust which languages are affected and the maximum threshold value that your formatter allows.

### Future Plans

- [ ] Formatting trigger when limit is reached
- [ ] Position of comments configured in settings (same line or above)
- [ ] Incorporate user feedback!
- [x] Automatic comment insertion which prevents default formatter from acting on the line. Only added when a given threshold is passed. Also configurable in settings.
- [x] Position and/or style indicator configured in settings

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Requirements

None 😋

<!-- If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->

## Extension Settings

You can add the following settings:

- `LWI.excludedLanguages`: An array of [languages identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers) for which you wish not to use the 'Line Width Indicator' extension.
- `LWI.limits.breakpoints`: The counter will change to the respective color when its count is below that column's value.
- `LWI.limits.formattingThreshold`: This should match your default formatter maximum width before it applies text wrapping.
- `LWI.comment.ignoreComment`: A comment that is added to preserve the current line formatting (no wrapping). Depending on your formatter, this will differ.
- `LWI.comment.autoRemoveBelowLower`: Once an ignore comment is added, this will auto remove it if the text length falls below the lowest breakpoint.
- `LWI.comment.autoRemoveAboveUpper`: Once an ignore comment is added, this will auto remove it if the text length passes the last breakpoint.
- `LWI.comment.autoComment`: Whether or not to automatically add the ignore comment.

## Available Commands

- `ctrl+k ctrl+a`: Enable LWI (on documents with supported languages)
- `ctrl+k ctrl+d`: Disable LWI

## Known Issues

None... yet 😁

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

This is an initial release, just to get familiar with VS Code extension publishing.
More work will be added in the very near future. Stay tuned!

See the [Change Log](https://marketplace.visualstudio.com/items/lbragile.line-width-indicator/changelog) for more in depth details.

---

<!-- ## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) -->

<!-- ## Working with Markdown

**Note:** You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
- Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
- Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets -->

<!-- ### For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/) -->

**Enjoy!**
