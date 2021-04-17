#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![warn(clippy::needless_borrow)]
#![allow(clippy::cast_lossless)]
#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::missing_panics_doc)]
#![allow(clippy::option_if_let_else)]
#![allow(unknown_lints)]
#![warn(broken_intra_doc_links)]
// #![warn(missing_docs)]
#![warn(missing_debug_implementations)]
#![warn(missing_copy_implementations)]
#![warn(rust_2018_idioms)]
#![warn(trivial_casts, trivial_numeric_casts)]
#![warn(unused_qualifications)]
#![warn(variant_size_differences)]

pub mod emscripten;
pub mod ffi;
pub mod interpreter;
pub mod meta;
pub mod string;

const REPL_FILENAME: &[u8] = b"(playground)";

#[cfg(test)]
mod filename_test {
    #[test]
    fn repl_filename_does_not_contain_nul_byte() {
        let contains_nul_byte = super::REPL_FILENAME.iter().copied().any(|b| b == b'\0');
        assert!(!contains_nul_byte);
    }
}
