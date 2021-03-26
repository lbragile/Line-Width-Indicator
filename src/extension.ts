import * as vscode from "vscode";

class LineWidthIndicator {
  #editor = vscode.window.activeTextEditor as vscode.TextEditor;
  #decorationType: vscode.TextEditorDecorationType;

  constructor(opts: { color: string; contentText: string }) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  /* @ts-ignore */
  get decorationType(): vscode.TextEditorDecorationType {
    return this.#decorationType;
  }

  /* @ts-ignore */
  set decorationType(opts: { color: string; contentText: string }) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  get activeEditor() {
    return this.#editor;
  }

  set activeEditor(editor) {
    this.#editor = editor;
  }

  getLineNum(editor: vscode.TextEditor): { position: vscode.Position; text: string } {
    const cursorPos = editor.selection.active;
    const lineText = editor.document.lineAt(cursorPos as vscode.Position);
    return { position: lineText?.range.end, text: lineText?.text };
  }

  getDecorDetails(text: string): { color: string; contentText: string } {
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

  appendCounterToLine = (e: vscode.TextDocumentChangeEvent, excludedLanguages: string[]): void => {
    const langIncluded = excludedLanguages.includes(e.document.languageId);
    // document type is not one of the excluded languages -> add LWI
    if (!langIncluded && e.contentChanges) {
      if (this.#editor) {
        const { position, text } = this.getLineNum(this.#editor);

        this.#decorationType.dispose();
        this.#decorationType = vscode.window.createTextEditorDecorationType({ after: this.getDecorDetails(text) });

        const range = [new vscode.Range(position, new vscode.Position(position.line, position.character + 3))];
        this.#editor.setDecorations(this.#decorationType, range);
      }
    } else {
      // remove LWI counter
      this.decorationType.dispose();
    }
  };
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Line Width Indicator is active!");

  const excludedLanguages = vscode.workspace.getConfiguration("LWI").get("excludedLanguages");
  if (!Array.isArray(excludedLanguages)) {
    vscode.window.showErrorMessage("Excluded languages must be an array!");
  } else {
    const LWI = new LineWidthIndicator({ color: "white", contentText: "" });
    let disposable = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e, excludedLanguages));
    context.subscriptions.push(disposable);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}

// registering a command

// let disposable = vscode.commands.registerCommand("line-width-indicator.activateLineWidthIndicator", () => {
//   // Display a message box to the user
//   vscode.window.showInformationMessage("Line Width Indicator is now active");

//   // editor?.edit((atCursorLineEnd) => atCursorLineEnd.insert(lineEndPos as vscode.Position, "hello"));
// });
