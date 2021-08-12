import type Interpreter from "./interpreter";
import type PlaygroundChrome from "./playground-chrome";

// Types of UI actions that can trigger an interpreter eval.
export enum EvalType {
  // Triggered by the "Run" button.
  button = "button",
  // Triggered by a code action in the Monaco Editor.
  codeAction = "code_action",
}

// Factory for an event handler that reads the source code in the editor buffer
// and evals it on an embedded Artichoke Wasm interpreter.
//
// The output editor is updated with the contents of the report from the
// interperter containing stdout, stderr, and the output from calling `inspect`
// on the returned value.
export class PlaygroundRunAction {
  private readonly evalType: EvalType;

  private readonly chrome: PlaygroundChrome;

  private counter = 0;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor(evalType: EvalType, chrome: PlaygroundChrome) {
    this.evalType = evalType;
    this.chrome = chrome;
  }

  // Create an event handler bound to the given interpreter with this Playground
  // run action's configuration.
  makeHandler(interp: Readonly<Interpreter>): () => void {
    return (): void => {
      const counter = this.counter + 1;
      this.counter = counter;

      const level = `playground-run-${this.evalType}-${counter}`;
      window.gtag("event", "level_start", {
        level_name: level,
      });

      const sourceLines =
        this.chrome.editor.getModel()?.getLinesContent() ?? [];
      const source = sourceLines.join("\n");
      const result = interp.evalRuby(source);
      this.chrome.outputPane.getModel()?.setValue(result);

      window.gtag("event", "level_end", {
        level_name: level,
        success: true,
      });
    };
  }
}
