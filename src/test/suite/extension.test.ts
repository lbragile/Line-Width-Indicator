import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { LineWidthIndicator } from "../../extension";

suite("LWI.getNumLine", () => {
  const opts = { color: "white", contentText: "" };

  test("output matches cursor position and line text", async () => {
    const LWI = new LineWidthIndicator(opts);
    const editor = LWI.getActiveEditor;
    const text = "Test LineWidthEditor\nTest Should Pass";

    // add text and set the cursor position to line 1, character 2
    await editor.edit((doc) => doc.insert(editor.selection.active, text));
    const expectPos = new vscode.Position(1, text.split("\n")[1].length);
    assert.deepStrictEqual(LWI.getLineNum(), { position: expectPos, text: text.split("\n")[1] });
  });
});

suite("LWI.getDecorDetails", () => {
  const opts = { color: "white", contentText: "" };
  let text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the indus"; // prettier-ignore
  const LWI = new LineWidthIndicator(opts);

  test("getDecorDetails", () => {
    const expectArr = [
      { extraText: "", color: "rgb(0, 255, 0, 0.6)", contentText: "  15" }, // before first threshold
      { extraText: "12345", color: "rgb(0, 255, 0, 0.6)", contentText: "  10" }, // at first threshold
      { extraText: "67", color: "rgb(255, 255, 0, 0.6)", contentText: "  8" }, // between first & second thresholds
      { extraText: "890", color: "rgb(255, 255, 0, 0.6)", contentText: "  5" }, // at second threshold
      { extraText: "12", color: "rgb(255, 165, 0, 0.6)", contentText: "  3" }, // between second & third thresholds
      { extraText: "345", color: "rgb(255, 165, 0, 0.6)", contentText: "  0" }, // at third threshold
      { extraText: "67", color: "rgb(255, 0, 0, 0.6)", contentText: "  -2" }, // between third and forth threshold
      { extraText: "890", color: "rgb(255, 0, 0, 0.6)", contentText: "  -5" }, // at forth threshold
      { extraText: "12345678", color: "rgb(255, 0, 0, 0.6)", contentText: "  -13" }, // after forth threshold
    ];

    expectArr.forEach((expect) => {
      text += expect.extraText;
      let result = LWI.getDecorDetails(text);
      assert.strictEqual(result.color, expect.color);
      assert.strictEqual(result.contentText, expect.contentText);
    });
  });
});
