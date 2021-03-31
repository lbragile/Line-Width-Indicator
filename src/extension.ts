import * as vscode from "vscode";
import { LineWidthIndicator } from "./components/LWI";

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage("Line Width Indicator extension is active!");

  const excLangs = vscode.workspace.getConfiguration("LWI").get("excludedLanguages") as string[];

  const LWI = new LineWidthIndicator({ color: "", contentText: "" });
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
export function deactivate() {
  vscode.window.showInformationMessage("Line Width Indicator extension was removed");
}
