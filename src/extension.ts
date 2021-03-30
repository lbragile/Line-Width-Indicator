import * as vscode from "vscode";

interface ITextDecor {
  color: string;
  contentText: string;
}

/**
 * Line Width Indicator (LWI) is a VS Code Extension that shows you the character count on each line with various colors.
 * If needed LWI also adds comments (defined in settings) to prevent formatters from considering the line.
 * LWI is open source: https://github.com/lbragile/Line-Width-Indicator
 * LWI is available on the VS Code Extension Store: https://marketplace.visualstudio.com/items?itemName=lbragile.line-width-indicator
 */
class LineWidthIndicator {
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
  constructor(opts: ITextDecor) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  /**
   * Accessor for decoration type member variable
   */
  get getDecorationType(): vscode.TextEditorDecorationType {
    return this.#decorationType;
  }

  /**
   * Mutator for decoration type member variable
   */
  set setDecorationType(opts: ITextDecor) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  /**
   * Accessor for editor member variable
   */
  get getActiveEditor() {
    return this.#editor;
  }

  /**
   * Mutator for editor member variable
   */
  set setActiveEditor(editor: vscode.TextEditor) {
    this.#editor = editor;
  }

  /**
   * Used to calculate the line number and position of the last
   * character on the line when a user is typing anywhere on that line.
   * @returns An object containing the position (includes line number) and line text
   */
  getLineNum(): { position: vscode.Position; text: string } {
    const cursorPos = this.#editor.selection.active;
    const lineText = this.#editor.document.lineAt(cursorPos as vscode.Position);
    return { position: lineText?.range.end, text: lineText?.text };
  }

  /**
   * When the user is typing, need to constantly update the counter (text decoration) details.
   * Here the user's settings are taken into account to calculate these details.
   * @param text the line's current text
   * @returns An object containing the correct color to use on the character counter and the counter text itself
   */
  getDecorDetails(text: string): ITextDecor {
    const settings = vscode.workspace.getConfiguration("LWI");
    const breakPoints = settings.get("breakpointRulers") as { color: string; column: number }[];
    const formatMaxWidth = settings.get("formatMaxWidth") as number;

    const columns = breakPoints.map((x) => x.column);
    const colors = breakPoints.map((x) => x.color);

    // produces an array of columns less than current text length.
    // the length of this array is the indicator of which color to use.
    // Need to set a hard stop if this value is greater than number of colors (text length > set limits)
    let indexToPick = columns.filter((limit) => limit < text.length).length;
    indexToPick = indexToPick === colors.length ? indexToPick - 1 : indexToPick;

    return { color: colors[indexToPick], contentText: `  ${formatMaxWidth - text.length}` };
  }

  /**
   * Adds the counter text to the line in real time as the user is typing.
   * Updates the active editor as needed when the document is switched.
   * If document's language is not supported (settings), disables counter decoration.
   * @param e The change event that occurred - either switched from one document to another or text within the document changed
   * @param excludedLanguages A list of languages (from settings) to not consider when adding the character counter - these are ignored.
   */
  appendCounterToLine = (e: vscode.TextDocumentChangeEvent, excludedLanguages: string[]): void => {
    const excluded = excludedLanguages.includes(e.document.languageId);

    // change editor if needed
    if (this.#editor !== vscode.window.activeTextEditor) {
      this.#editor = vscode.window.activeTextEditor as vscode.TextEditor;
    }

    if (!excluded && this.#editor && this.#decorationType) {
      // document type is not one of the excluded languages -> add LWI
      const { position, text } = this.getLineNum();

      this.#decorationType.dispose();
      this.#decorationType = vscode.window.createTextEditorDecorationType({ after: this.getDecorDetails(text) });

      const range = [new vscode.Range(new vscode.Position(0, 0), position)];
      this.#editor.setDecorations(this.#decorationType, range);
    } else {
      // remove LWI counter
      this.getDecorationType.dispose();
    }
  };
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Line Width Indicator is active!");

  const excLangs = vscode.workspace.getConfiguration("LWI").get("excludedLanguages") as string[];

  const LWI = new LineWidthIndicator({ color: "white", contentText: "" });
  let changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e, excLangs));

  let activateEvent = vscode.commands.registerCommand("LWI.activateLWI", () => {
    vscode.window.showInformationMessage("Line Width Indicator is now enabled");
    changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e, excLangs));
  });

  let deactivateEvent = vscode.commands.registerCommand("LWI.deactivateLWI", () => {
    vscode.window.showInformationMessage("Line Width Indicator is now disabled");
    changeTextEvent.dispose();
    LWI.getDecorationType.dispose();
  });

  if (!Array.isArray(excLangs)) {
    vscode.window.showErrorMessage("Excluded languages must be an array!");
  }

  context.subscriptions.push(changeTextEvent, activateEvent, deactivateEvent);
}

// this method is called when your extension is deactivated
export function deactivate() {}
