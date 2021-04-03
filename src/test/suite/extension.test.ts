import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";

import { LineWidthIndicator } from "../../components/LWI";

const opts = { color: "", contentText: "" };

suite("LWI.getNumLine", () => {
  test("output matches cursor position and line text", async () => {
    const LWI = new LineWidthIndicator(opts);
    const editor = LWI.activeEditor;
    const text = "Test LineWidthEditor\nTest Should Pass";

    // add text and set the cursor position to line 1, character 2
    await editor.edit((doc) => doc.insert(editor.selection.active, text));
    const expectPos = new vscode.Position(1, text.split("\n")[1].length);
    assert.deepStrictEqual(LWI.getLineNum(), { position: expectPos, text: text.split("\n")[1] });
  });
});

suite("LWI.getDecorDetails", () => {
  let text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the indus"; // prettier-ignore
  const LWI = new LineWidthIndicator(opts);

  const expectArr = [
    { extraText: "", color: "rgb(0, 255, 0, 0.6)", contentText: "5", description: "before 1st threshold" },
    { extraText: "12345", color: "rgb(0, 255, 0, 0.6)", contentText: "0", description: "at 1st threshold" },
    { extraText: "12", color: "rgb(255, 255, 0, 0.6)", contentText: "3", description: "between 1st & 2nd thresholds" },
    { extraText: "345", color: "rgb(255, 255, 0, 0.6)", contentText: "0", description: "at 2nd threshold" },
    { extraText: "67", color: "rgb(255, 0, 0, 0.6)", contentText: "3", description: "between 2nd and last threshold" },
    { extraText: "890", color: "rgb(255, 0, 0, 0.6)", contentText: "0", description: "at 3rd threshold" },
    { extraText: "67890", color: "rgb(255, 0, 0, 0.6)", contentText: "-5", description: "after 3rd threshold" },
  ];

  expectArr.forEach((expect, index) => {
    test(`${index}. ${expect.description} → ${expect.color}, ${expect.contentText}`, () => {
      text += expect.extraText;
      let result = LWI.getDecorDetails(text);
      assert.strictEqual(result.color, expect.color);
      assert.strictEqual(result.contentText, expect.contentText);
    });
  });
});

suite("LWI.handleSelectionChange", () => {
  const LWI = new LineWidthIndicator(opts);
  const appendCounterToLineSpy = sinon.spy(LWI, "appendCounterToLine");

  [undefined, 0, 1, 2].forEach((kind) => {
    test(`kind === ${kind}`, () => {
      const pos = new vscode.Position(0, 0);
      const stub: vscode.TextEditorSelectionChangeEvent = {
        kind,
        textEditor: vscode.window.activeTextEditor as vscode.TextEditor,
        selections: [new vscode.Selection(pos, pos)],
      };
      sinon.resetHistory();

      LWI.handleSelectionChange(stub);

      if (stub.kind && stub.kind >= 1) {
        sinon.assert.calledOnceWithExactly(appendCounterToLineSpy, stub.textEditor.document);
      } else {
        sinon.assert.notCalled(appendCounterToLineSpy);
      }
    });
  });
});
