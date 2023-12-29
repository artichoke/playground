//! Extract information about the embedded [`Artichoke`] interpreter.
//!
//! [`Artichoke`]: artichoke::Artichoke

use artichoke::prelude::{Value as _, *};

/// Generate information about the current Artichoke build to be displayed in
/// the playground editor UI.
///
/// Build info includes the values of the `RUBY_DESCRIPTION` and
/// `ARTICHOKE_COMPILER_VERSION` constants in the embedded Artichoke interpreter.
/// These constants include information stamped into the binary at build time.
///
/// # Examples
///
/// ```text
/// artichoke 0.1.0-pre.0 (2023-04-25 revision 6718) [wasm32-unknown-emscripten]
/// [rustc 1.69.0 (84c898d65 2023-04-16) on x86_64-unknown-linux-gnu]
/// ```
pub fn build_info(interp: &mut Artichoke) -> String {
    let mut description = interp
        .eval(b"RUBY_DESCRIPTION")
        .and_then(|value| value.try_convert_into_mut::<String>(interp))
        .unwrap_or_default();
    let compiler = interp
        .eval(b"ARTICHOKE_COMPILER_VERSION")
        .and_then(|value| value.try_convert_into_mut::<&str>(interp))
        .unwrap_or_default();
    description.push('\n');
    description.push('[');
    description.push_str(compiler);
    description.push(']');
    description
}

#[cfg(test)]
mod tests {
    use super::build_info;

    #[test]
    fn build_meta_contents() {
        let mut interp = artichoke::interpreter().unwrap();
        let meta = build_info(&mut interp);
        assert!(meta.starts_with("artichoke 0.1.0-pre.0 ("));
        assert_eq!(meta.lines().count(), 2);
        let compiler_meta = meta.lines().nth(1).unwrap();
        assert!(
            compiler_meta.starts_with("[rustc 1.72.1 (d5c2e9c34 2023-09-13) on "),
            "Compiler meta mismatch, got: {compiler_meta}"
        );
    }
}
