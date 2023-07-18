import * as monaco from "monaco-editor";

// Data class for passing around references to the Monaco editor surfaces that
// comprise the playground UI chrome.
export default class PlaygroundChrome {
  // A read/write Monaco editor configured for Ruby code that is used to accept
  // a Ruby program for eval'ing on an `Interpreter`.
  readonly editor: monaco.editor.IStandaloneCodeEditor;

  // A read-only TTY-style Monaco editor configured as a plaintext output window
  // for eval' stdout, stderr, and result.
  //
  // This pane displays contents similarly to `irb`.
  readonly outputPane: monaco.editor.IStandaloneCodeEditor;

  constructor(
    editor: monaco.editor.IStandaloneCodeEditor,
    outputPane: monaco.editor.IStandaloneCodeEditor,
  ) {
    this.editor = editor;
    this.outputPane = outputPane;
  }
}
