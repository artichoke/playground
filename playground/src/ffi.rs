use std::mem::ManuallyDrop;

use crate::interpreter::Interp;
use crate::string::Heap;

/// String heap for marshalling data between Rust and JavaScript.
#[derive(Default, Debug, Clone)]
pub struct State {
    pub heap: Heap,
}

#[no_mangle]
#[must_use]
pub extern "C" fn artichoke_web_repl_init() -> u32 {
    let mut state = Box::<State>::default();
    let build = match Interp::new() {
        Ok(mut interp) => interp
            .metadata()
            .unwrap_or_else(|| String::from("Could not extract interpreter metadata")),
        Err(err) => err.to_string(),
    };
    println!("{build}");
    state.heap.allocate(build);
    Box::into_raw(state) as u32
}

#[no_mangle]
#[must_use]
pub extern "C" fn artichoke_string_new(state: u32) -> u32 {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let mut state = ManuallyDrop::new(state);
    state.heap.allocate(String::new())
}

#[no_mangle]
pub extern "C" fn artichoke_string_free(state: u32, ptr: u32) {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let mut state = ManuallyDrop::new(state);
    state.heap.free(ptr);
}

#[no_mangle]
#[must_use]
pub extern "C" fn artichoke_string_getlen(state: u32, ptr: u32) -> u32 {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let state = ManuallyDrop::new(state);
    state.heap.string_getlen(ptr)
}

#[no_mangle]
#[must_use]
pub extern "C" fn artichoke_string_getch(state: u32, ptr: u32, idx: u32) -> u8 {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let state = ManuallyDrop::new(state);
    state.heap.string_getch(ptr, idx)
}

#[no_mangle]
pub extern "C" fn artichoke_string_putch(state: u32, ptr: u32, ch: u8) {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let mut state = ManuallyDrop::new(state);
    state.heap.string_putch(ptr, ch);
}

#[no_mangle]
#[must_use]
pub extern "C" fn artichoke_eval(state: u32, ptr: u32) -> u32 {
    assert_ne!(state, 0, "null pointer");

    let state = unsafe { Box::from_raw(state as *mut State) };
    let mut state = ManuallyDrop::new(state);
    let code = state.heap.string(ptr);

    let out = match Interp::new() {
        Ok(mut interp) => interp
            .eval_to_report(code)
            .unwrap_or_else(|| String::from("Fatal error")),
        Err(err) => err.to_string(),
    };

    state.heap.allocate(out)
}
