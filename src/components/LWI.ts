import * as vscode from "vscode";
import { IStyle, IBreakpoints } from "../typings/LWI";

/**
 * Line Width Indicator (LWI) is a VS Code Extension that shows you the character count on each line with various colors.
 * If needed LWI also adds comments (defined in settings) to prevent formatters from considering the line.
 * @see LWI is open source: https://github.com/lbragile/Line-Width-Indicator
 * @see LWI is available on the VS Code Extension Store: https://marketplace.visualstudio.com/items?itemName=lbragile.line-width-indicator
 */
export class LineWidthIndicator {
  /**
   * @private Current editor where the user is typing
   */
  #editor = vscode.window.activeTextEditor as vscode.TextEditor;

  /**
   * @private The decoration of the character counter
   */
  #decorationType: vscode.TextEditorDecorationType;

  /**
   *
   * @param opts style applied to the character counter
   */
  constructor(opts: vscode.ThemableDecorationAttachmentRenderOptions) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  /**
   * Accessor for decoration type member variable
   */
  get counterDecoration(): vscode.TextEditorDecorationType {
    return this.#decorationType;
  }

  /**
   * Mutator for editor member variable
   */
  set counterDecoration(decoration: vscode.TextEditorDecorationType) {
    this.#decorationType = decoration;
  }

  /**
   * Accessor for editor member variable
   */
  get activeEditor() {
    return this.#editor;
  }

  /**
   * Mutator for editor member variable
   */
  set activeEditor(editor: vscode.TextEditor) {
    this.#editor = editor;
  }

  /**
   * Used to calculate the line number and position of the last
   * character on the line when a user is typing anywhere on that line.
   * @returns An object containing the position (includes line number) and line text
   */
  getLineNum(): { position: vscode.Position; text: string } {
    const editor = this.activeEditor;
    const cursorPos = editor.selection.active;
    const lineText = editor.document.lineAt(cursorPos as vscode.Position);
    return { position: lineText?.range.end, text: lineText?.text };
  }

  /**
   * When the user is typing, need to constantly update the counter (text decoration) details.
   * Here the user's settings are taken into account to calculate these details.
   * @param text the line's current text
   * @returns An object containing the correct color to use on the character counter and the counter text itself
   */
  getDecorDetails(text: string): vscode.ThemableDecorationAttachmentRenderOptions {
    const settings = vscode.workspace.getConfiguration("LWI");
    const breakPoints = settings.get("breakpoints") as IBreakpoints[];
    const { margin, fontStyle, fontWeight, backgroundColor } = settings.get("style") as IStyle;

    const columns = breakPoints.map((x) => x.column);
    const colors = breakPoints.map((x) => x.color);

    // produces an array of columns less than current text length.
    // the length of this array is the indicator of which color to use.
    // Need to set a hard stop if this value is greater than number of colors (text length > set limits)
    const indexToPick = Math.min(columns.filter((limit) => limit < text.length).length, columns.length - 1);

    return {
      color: colors[indexToPick],
      contentText: `${columns[indexToPick] - text.length}`,
      margin: margin + "px",
      fontStyle,
      fontWeight,
      backgroundColor,
    };
  }

  /**
   * When the user uses the mouse or keyboard to select a different line, this moves the decoration to that line
   * @param e Represents an event describing the change in a text editor's selections
   */
  handleSelectionChange(e: vscode.TextEditorSelectionChangeEvent): void {
    if (e.kind && e.kind >= 1) {
      // keyboard or mouse selection change
      this.counterDecoration.dispose();
      this.appendCounterToLine(e.textEditor.document);
    }
  }

  /**
   * Adds the counter text to the line in real time as the user is typing.
   * Updates the active editor as needed when the document is switched.
   * If document's language is not supported (settings), disables counter decoration.
   * @param document The document on which the change event occurred
   */
  appendCounterToLine(document: vscode.TextDocument): void {
    const excludedLanguages = vscode.workspace.getConfiguration("LWI").get("excludedLanguages") as string[];
    const excluded = excludedLanguages.includes(document.languageId);

    // change editor if needed
    if (this.activeEditor !== vscode.window.activeTextEditor) {
      this.activeEditor = vscode.window.activeTextEditor as vscode.TextEditor;
    }

    const editor = this.activeEditor;

    // document type is not one of the excluded languages -> add LWI
    const { position, text } = this.getLineNum();

    // get rid of old decoration
    this.counterDecoration.dispose();

    // only add new decoration and/or comment if the user typed something on that line previously
    if (!excluded && editor && this.counterDecoration && text.length > 0) {
      this.counterDecoration = vscode.window.createTextEditorDecorationType({ after: this.getDecorDetails(text) });
      editor.setDecorations(this.counterDecoration, [new vscode.Range(position, position)]);
    }
  }

  /**
   * Allow the user to use a command (Ctrl + Shift + /) to add/remove a formatting ignore comment
   */
  async toggleIgnoreComment(): Promise<void> {
    const comment = " " + vscode.workspace.getConfiguration("LWI").get("ignoreComment");

    // get text after current cursor position to see if comment is already added
    const editor = this.activeEditor;
    const curPos = editor.selection.active;
    const endPos = editor.document.lineAt(curPos.line)?.range.end;
    const text = editor.document.getText(new vscode.Range(new vscode.Position(endPos.line, 0), endPos));

    // only want to add a comment (to end of line) when it isn't added yet
    if (!text.includes(comment)) {
      await editor.edit((atPos) => atPos.insert(endPos, comment));
    } else {
      const commentStart = endPos.translate(0, -1 * comment.length);
      const commentRange = new vscode.Range(commentStart, endPos);
      await editor.edit((atPos) => atPos.replace(commentRange, ""));
    }
  }

  /**
   * Allows the user to use a command (ctrl + shift + i) to enable/disable LWI
   * @param changeTextEvent Used to detect typing changes
   * @param changeSelectionEvent Used to detect mouse or keyboard selection changes
   * @returns The new disposable values which can be used to add/remove the LWI counter
   */
  toggleExtensionState(
    changeTextEvent: vscode.Disposable,
    changeSelectionEvent: vscode.Disposable
  ): vscode.Disposable[] {
    if (changeTextEvent.dispose.name === "") {
      // enable LWI
      // vscode.window.showInformationMessage("Line Width Indicator is now enabled");
      changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => this.appendCounterToLine(e.document));
      changeSelectionEvent = vscode.window.onDidChangeTextEditorSelection((e) => this.handleSelectionChange(e));
    } else {
      // disable LWI
      // vscode.window.showInformationMessage("Line Width Indicator is now disabled");
      changeTextEvent.dispose();
      changeSelectionEvent.dispose();
      this.counterDecoration.dispose();
    }

    return [changeTextEvent, changeSelectionEvent];
  }
}
