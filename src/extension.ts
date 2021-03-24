import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "line-width-indicator" is now active!');

  let disposable = vscode.commands.registerCommand("line-width-indicator.activateLineWidthIndicator", () => {
    // Display a message box to the user
    vscode.window.showInformationMessage("Line Width Indicator is now active");

    const editor = vscode.window.activeTextEditor;
    const cursorPos = editor?.selection.active;
    const lineEndPos = editor?.document.lineAt(cursorPos as vscode.Position).range.end;
    editor?.edit((atCursorLineEnd) => atCursorLineEnd.insert(lineEndPos as vscode.Position, "hello"));
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
