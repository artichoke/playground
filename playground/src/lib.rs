#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![warn(clippy::needless_borrow)]
#![allow(clippy::cast_lossless)]
#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::missing_panics_doc)]
#![allow(clippy::option_if_let_else)]
#![allow(unknown_lints)]
#![warn(rustdoc::broken_intra_doc_links)]
#![warn(missing_docs)]
#![warn(missing_debug_implementations)]
#![warn(missing_copy_implementations)]
#![warn(rust_2018_idioms)]
#![warn(trivial_casts, trivial_numeric_casts)]
#![warn(unused_qualifications)]
#![warn(variant_size_differences)]

//! The Artichoke Wasm playground.

#[cfg(target_os = "emscripten")]
pub mod emscripten;
pub mod ffi;
pub mod interpreter;
pub mod meta;
pub mod string;

/// Filename for inline code executed on the playground frontend via the embedded
/// code editor.
/// switch.
///
/// # Examples
///
/// ```console
/// > __FILE__
/// => "(playground)"
/// ```
pub const REPL_FILENAME: &[u8] = b"(playground)";

#[cfg(test)]
mod test {
    use artichoke::backend::state::parser::Context;

    #[test]
    fn repl_filename_does_not_contain_nul_byte() {
        let contains_nul_byte = super::REPL_FILENAME.iter().copied().any(|b| b == b'\0');
        assert!(!contains_nul_byte);
    }

    #[test]
    fn repl_filename_context_new_unchecked_safety() {
        Context::new(super::REPL_FILENAME).unwrap();
    }
}
