import * as vscode from "vscode";

interface ITextDecor {
  color: string;
  contentText: string;
}

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
    const breakPoints = vscode.workspace.getConfiguration("LWI").get("limits.breakpoints") as { color: string; column: number }[]; // prettier-ignore

    const columns = breakPoints.map((x) => x.column);
    const colors = breakPoints.map((x) => x.color);

    // produces an array of columns less than current text length.
    // the length of this array is the indicator of which color to use.
    // Need to set a hard stop if this value is greater than number of colors (text length > set limits)
    let indexToPick = columns.filter((limit) => limit < text.length).length;
    indexToPick = indexToPick === colors.length ? indexToPick - 1 : indexToPick;

    return { color: colors[indexToPick], contentText: `  ${columns[indexToPick] - text.length}` };
  }

  /**
   * Adds the counter text to the line in real time as the user is typing.
   * Updates the active editor as needed when the document is switched.
   * If document's language is not supported (settings), disables counter decoration.
   * @param e The change event that occurred - either switched from one document to another or text within the document changed
   * @param excludedLanguages A list of languages (from settings) to not consider when adding the character counter - these are ignored.
   */
  appendCounterToLine(e: vscode.TextDocumentChangeEvent, excludedLanguages: string[]): void {
    const excluded = excludedLanguages.includes(e.document.languageId);

    // change editor if needed
    if (this.#editor !== vscode.window.activeTextEditor) {
      this.#editor = vscode.window.activeTextEditor as vscode.TextEditor;
    }

    if (!excluded && this.#editor && this.#decorationType) {
      // document type is not one of the excluded languages -> add LWI
      const { position, text } = this.getLineNum();

      this.toggleIgnoreComment(text);

      // make a new decoration
      this.#decorationType.dispose();
      this.#decorationType = vscode.window.createTextEditorDecorationType({ after: this.getDecorDetails(text) });

      const range = [new vscode.Range(new vscode.Position(0, 0), position)];
      this.#editor.setDecorations(this.#decorationType, range);
    } else {
      // remove LWI counter
      this.getDecorationType.dispose();
    }
  }

  /**
   * If the current text length is between the last breakpoint and threshold limit (from settings) a comment is added
   * to prevent the formatter from applying to this line. Once the length of the text exceeds the last breakpoint
   * column + threshold value, the comment is removed. This all happens automatically.
   * @param text The current text of the line being edited
   */
  async toggleIgnoreComment(text: string): Promise<void> {
    // get relevant settings
    const settings = vscode.workspace.getConfiguration("LWI");
    const threshold = settings.get("limits.formattingThreshold") as number;
    const breakpoints = settings.get("limits.breakpoints") as { color: string; column: number }[];
    const comment = (" " + settings.get("comment.ignoreComment")) as string;
    const autoComment = settings.get("comment.autoComment") as boolean;
    const upperRemove = settings.get("comment.autoRemoveAboveUpper") as boolean;
    const lowerRemove = settings.get("comment.autoRemoveBelowLower") as boolean;

    if (autoComment) {
      const lastColumn = breakpoints[breakpoints.length - 1].column;

      // get text after current cursor position to see if comment is already added
      let curPos = this.#editor.selection.active;
      curPos = new vscode.Position(curPos.line, curPos.character + 1);

      const textLine = this.#editor.document.lineAt(curPos.line);
      const endPos = textLine?.range.end;
      const commentRange = new vscode.Range(endPos.line, Math.max(0, endPos.character - comment.length), endPos.line, endPos.character); // prettier-ignore
      const commentRangeText = this.#editor.document.getText(commentRange);

      // insert comment only on lines that are not comments themselves
      if (textLine?.text.substr(textLine.firstNonWhitespaceCharacterIndex, 2) !== "//") {
        if (lastColumn < text.length && text.length <= lastColumn + threshold && commentRangeText !== comment) {
          // only want to add a comment (to end of line) when it isn't added yet
          await this.#editor.edit((atPos) => atPos.insert(endPos, comment));

          // move cursor back to where it was prior to insertion.
          // This will be the end position prior to adding the comment.
          // Only move if the cursor is past the newly inserted comment section
          if (this.#editor.selection.active.character === endPos.character + comment.length) {
            this.#editor.selection = new vscode.Selection(endPos, endPos);
          }
        }

        // remove the comment once threshold is passed (as defined in the settings)
        const lowerBound = lastColumn + comment.length;
        const upperBound = lowerBound + threshold;
        if (
          commentRangeText.includes(comment) &&
          ((upperBound < text.length && upperRemove) || (text.length <= lowerBound && lowerRemove))
        ) {
          await this.#editor.edit((atPos) => atPos.replace(commentRange, ""));
        }
      }
    }
  }
}
