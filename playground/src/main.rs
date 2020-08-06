#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![allow(clippy::cast_lossless)]
#![allow(clippy::cast_possible_truncation)]
#![warn(clippy::cargo)]
#![allow(unknown_lints)]
// #![warn(missing_docs, broken_intra_doc_links)]
#![warn(missing_debug_implementations)]
#![warn(missing_copy_implementations)]
#![warn(rust_2018_idioms)]
#![warn(trivial_casts, trivial_numeric_casts)]
#![warn(unused_qualifications)]
#![warn(variant_size_differences)]

#[macro_use]
extern crate artichoke_backend;

pub mod ffi;
mod interpreter;
mod meta;
mod string;
mod web;

const REPL_FILENAME: &[u8] = b"(playground)";

fn main() {
    stdweb::initialize();
    stdweb::event_loop();
}
