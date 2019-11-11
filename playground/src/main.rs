#![deny(warnings, intra_doc_link_resolution_failure)]
#![deny(clippy::all, clippy::pedantic)]
#![allow(clippy::cast_possible_truncation, clippy::cast_lossless)]

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
