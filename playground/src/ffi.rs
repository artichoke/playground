use std::mem;

use crate::interpreter::{Interp, State};

#[no_mangle]
#[must_use]
pub fn artichoke_web_repl_init() -> u32 {
    let mut state = Box::new(State::default());
    let build = Interp::build_meta();
    println!("{}", build);
    state.heap.allocate(build);
    Box::into_raw(state) as u32
}

#[no_mangle]
#[must_use]
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
#[must_use]
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
#[must_use]
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
#[must_use]
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
