import * as vscode from "vscode";

class LineWidthIndicator {
  #decorationType: vscode.TextEditorDecorationType;

  constructor(opts: { color: string; contentText: string }) {
    this.#decorationType = vscode.window.createTextEditorDecorationType({ after: opts });
  }

  getLineNum(editor: vscode.TextEditor): { position: vscode.Position; text: string } {
    const cursorPos = editor.selection.active;
    const lineText = editor.document.lineAt(cursorPos as vscode.Position);
    return { position: lineText?.range.end, text: lineText?.text };
  }

  getDecorDetails(text: string): { color: string; contentText: string } {
    const settings = vscode.workspace.getConfiguration("line-width-indicator");
    const breakPoints = settings.get("breakpointRulers") as { color: string; column: number }[];

    const columns = breakPoints.map((x) => x.column);
    const colors = breakPoints.map((x) => x.color);

    // produces an array of columns less than current text length.
    // the length of this array is the indicator of which color to use.
    // Need to set a hard stop if this value is greater than number of colors (text length > set limits)
    let indexToPick = columns.filter((limit) => limit < text.length).length;
    indexToPick = indexToPick === colors.length ? indexToPick - 1 : indexToPick;

    return { color: colors[indexToPick], contentText: `  ${120 - text.length}` };
  }

  appendCounterToLine = (e: vscode.TextDocumentChangeEvent): void => {
    if (e.contentChanges) {
      const editor = vscode.window.activeTextEditor as vscode.TextEditor;
      if (editor) {
        const { position, text } = this.getLineNum(editor);

        this.#decorationType.dispose();
        this.#decorationType = vscode.window.createTextEditorDecorationType({ after: this.getDecorDetails(text) });

        const range = [new vscode.Range(position, new vscode.Position(position.line, position.character + 3))];
        editor.setDecorations(this.#decorationType, range);
      }
    }
  };
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Line Width Indicator is active!");

  const LWI = new LineWidthIndicator({ color: "white", contentText: "" });
  let disposable = vscode.workspace.onDidChangeTextDocument(LWI.appendCounterToLine);

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

// registering a command

// let disposable = vscode.commands.registerCommand("line-width-indicator.activateLineWidthIndicator", () => {
//   // Display a message box to the user
//   vscode.window.showInformationMessage("Line Width Indicator is now active");

//   // editor?.edit((atCursorLineEnd) => atCursorLineEnd.insert(lineEndPos as vscode.Position, "hello"));
// });
