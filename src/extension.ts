import * as vscode from "vscode";
import { LineWidthIndicator } from "./components/LWI";

export function activate(context: vscode.ExtensionContext): void {
  const LWI = new LineWidthIndicator({ color: "", contentText: "" });

  let changeTextEvent = vscode.workspace.onDidChangeTextDocument((e) => LWI.appendCounterToLine(e.document));
  let changeSelectionEvent = vscode.window.onDidChangeTextEditorSelection((e) => LWI.handleSelectionChange(e));
  let toggleComment = vscode.commands.registerCommand("LWI.toggleComment", () => LWI.toggleIgnoreComment());
  let toggleState = vscode.commands.registerCommand("LWI.toggleState", () => {
    [changeTextEvent, changeSelectionEvent] = LWI.toggleExtensionState(changeTextEvent, changeSelectionEvent);
  });

  context.subscriptions.push(changeTextEvent, changeSelectionEvent, toggleState, toggleComment);
}

export function deactivate() {
  vscode.window.showInformationMessage("Line Width Indicator extension was removed");
}
