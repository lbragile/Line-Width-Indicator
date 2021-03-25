import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "line-width-indicator" is now active!');

  let disposable = vscode.workspace.onDidChangeTextDocument(appendCounterToLine);

  // let disposable = vscode.commands.registerCommand("line-width-indicator.activateLineWidthIndicator", () => {
  //   // Display a message box to the user
  //   vscode.window.showInformationMessage("Line Width Indicator is now active");

  //   // editor?.edit((atCursorLineEnd) => atCursorLineEnd.insert(lineEndPos as vscode.Position, "hello"));
  // });

  context.subscriptions.push(disposable);
}

let decorationType = vscode.window.createTextEditorDecorationType({
  after: { color: "rgb(0, 255, 0, 0.6)", contentText: `\t\t120` },
});

function getLineNum(editor: vscode.TextEditor): { position: vscode.Position; text: string } {
  const cursorPos = editor.selection.active;
  const lineText = editor.document.lineAt(cursorPos as vscode.Position);
  return { position: lineText?.range.end, text: lineText?.text };
}

const appendCounterToLine = async (e: vscode.TextDocumentChangeEvent): Promise<boolean> => {
  if (e.contentChanges) {
    const editor = vscode.window.activeTextEditor as vscode.TextEditor;
    let retVal: boolean = false;
    if (editor) {
      const { position, text } = getLineNum(editor);

      decorationType.dispose();
      decorationType = vscode.window.createTextEditorDecorationType({
        after: {
          color: `${
            text.length + 10 <= 120
              ? "rgb(0, 255, 0, 0.6)"
              : text.length + 5 <= 120
              ? "rgb(255, 255, 0, 0.6)"
              : text.length <= 120
              ? "rgb(255, 165, 0, 0.6)"
              : "rgb(255, 0, 0, 0.6)"
          }`,
          contentText: `  ${120 - text.length}`,
        },
      });

      const range = [new vscode.Range(position, new vscode.Position(position.line, position.character + 3))];
      editor.setDecorations(decorationType, range);

      if (text.length > 120 + 5 - 1) {
        retVal = (await editor.edit((atCursorPos) => atCursorPos.insert(position, " // prettier-ignore\r"))) as boolean;
      }
    }

    return retVal;
  } else {
    return await new Promise((resolve) => resolve(false));
  }
};

// this method is called when your extension is deactivated
export function deactivate() {}
