#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![warn(clippy::needless_borrow)]
#![allow(clippy::cast_lossless)]
#![allow(clippy::cast_possible_truncation)]
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

//! Entrypoint for Artichoke Wasm playground.

#[cfg(target_os = "emscripten")]
fn main() {
    use playground::emscripten::{set_main_loop_callback, EmptyMainLoop};

    set_main_loop_callback(EmptyMainLoop);
}

#[cfg(not(target_os = "emscripten"))]
fn main() {
    eprintln!("The playground only supports the wasm32-unknown-emscripten target.");
    eprintln!(
        "See the `build` scripts in `package.json` and `scripts/build-wasm.rb` for a build recipe."
    );
    std::process::exit(1);
}
