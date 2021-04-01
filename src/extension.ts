import * as vscode from "vscode";
import { LineWidthIndicator } from "./components/LWI";

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage("Line Width Indicator extension is active!");

  const LWI = new LineWidthIndicator({ color: "", contentText: "" });

  let changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e.document));
  let changeSelectionEvent = vscode.window.onDidChangeTextEditorSelection((e) => LWI.handleSelectionChange(e));

  let activateEvent = vscode.commands.registerCommand("LWI.activateLWI", () => {
    vscode.window.showInformationMessage("Line Width Indicator is now enabled");
    changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e.document));
  });

  let deactivateEvent = vscode.commands.registerCommand("LWI.deactivateLWI", () => {
    vscode.window.showInformationMessage("Line Width Indicator is now disabled");
    changeTextEvent.dispose();
    LWI.getDecorationType.dispose();
  });

  context.subscriptions.push(changeTextEvent, changeSelectionEvent, activateEvent, deactivateEvent);
}

// this method is called when your extension is deactivated
export function deactivate() {
  vscode.window.showInformationMessage("Line Width Indicator extension was removed");
}
