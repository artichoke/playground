#![deny(warnings, intra_doc_link_resolution_failure)]
#![deny(clippy::all, clippy::pedantic)]
#![allow(clippy::cast_possible_truncation, clippy::cast_lossless)]

use artichoke_backend::eval::{Context, Eval};
use artichoke_backend::Artichoke;
use artichoke_core::value::Value;
use std::mem;
use std::panic::{self, AssertUnwindSafe};

mod meta;
mod string;

const REPL_FILENAME: &[u8] = b"(playground)";

#[derive(Default, Debug, Clone)]
struct State {
    heap: string::Heap,
}

struct Interp(Option<Artichoke>);

impl Interp {
    fn new() -> Self {
        let interp = match artichoke_backend::interpreter() {
            Ok(interp) => interp,
            Err(err) => {
                eprintln!("{:?}", err);
                panic!("Could not initialize interpreter");
            }
        };
        interp.0.borrow_mut().capture_output();
        interp.push_context(Context::new(REPL_FILENAME));
        Self(Some(interp))
    }

    fn build_meta() -> String {
        let interp = Self::new();
        if let Some(ref interp) = interp.0 {
            meta::build_info(&interp)
        } else {
            "Could not extract build meta".to_owned()
        }
    }

    fn eval(&self, code: &[u8]) -> String {
        if let Some(ref interp) = self.0 {
            match panic::catch_unwind(AssertUnwindSafe(|| interp.eval(code))) {
                Ok(Ok(value)) => format!("=> {}", value.inspect()),
                Ok(Err(err)) => err.to_string(),
                Err(_) => "Panicked during eval".to_owned(),
            }
        } else {
            "".to_owned()
        }
    }

    fn captured_output(&self) -> String {
        if let Some(ref interp) = self.0 {
            interp.0.borrow_mut().get_and_clear_captured_output()
        } else {
            "".to_owned()
        }
    }
}

impl Drop for Interp {
    fn drop(&mut self) {
        if let Some(interp) = self.0.take() {
            interp.close();
        }
    }
}

#[no_mangle]
pub fn artichoke_web_repl_init() -> u32 {
    let mut state = Box::new(State::default());
    let build = Interp::build_meta();
    println!("{}", build);
    state.heap.allocate(build);
    Box::into_raw(state) as u32
}

#[no_mangle]
pub fn artichoke_string_new(state: u32) -> u32 {
    if state == 0 {
        panic!("null pointer");
    }
    let mut state = unsafe { Box::from_raw(state as *mut State) };
    let s = state.heap.allocate("".to_owned());
    mem::forget(state);
    s
}

#[no_mangle]
pub fn artichoke_string_free(state: u32, ptr: u32) {
    if state == 0 {
        panic!("null pointer");
    }
    let mut state = unsafe { Box::from_raw(state as *mut State) };
    state.heap.free(ptr);
    mem::forget(state);
}

#[no_mangle]
pub fn artichoke_string_getlen(state: u32, ptr: u32) -> u32 {
    if state == 0 {
        panic!("null pointer");
    }
    let state = unsafe { Box::from_raw(state as *mut State) };
    let len = state.heap.string_getlen(ptr);
    mem::forget(state);
    len
}

#[no_mangle]
pub fn artichoke_string_getch(state: u32, ptr: u32, idx: u32) -> u8 {
    if state == 0 {
        panic!("null pointer");
    }
    let state = unsafe { Box::from_raw(state as *mut State) };
    let ch = state.heap.string_getch(ptr, idx);
    mem::forget(state);
    ch
}

#[no_mangle]
pub fn artichoke_string_putch(state: u32, ptr: u32, ch: u8) {
    if state == 0 {
        panic!("null pointer");
    }
    let mut state = unsafe { Box::from_raw(state as *mut State) };
    state.heap.string_putch(ptr, ch);
    mem::forget(state);
}

#[no_mangle]
pub fn artichoke_eval(state: u32, ptr: u32) -> u32 {
    if state == 0 {
        panic!("null pointer");
    }
    let mut state = unsafe { Box::from_raw(state as *mut State) };
    let code = state.heap.string(ptr);
    let interp = Interp::new();
    let result = interp.eval(code);
    let output = interp.captured_output();
    let result = format!("{}{}", output, result);
    let s = state.heap.allocate(result);
    mem::forget(state);
    s
}

fn main() {
    stdweb::event_loop();
}
