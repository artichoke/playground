//! FFI utilities for JavaScript / Rust interop over Wasm.

use std::mem::{size_of, ManuallyDrop};

use crate::interpreter::Interp;
use crate::string::Heap;

/// String heap for marshalling data between Rust and JavaScript.
#[derive(Default, Debug, Clone)]
pub struct State {
    /// The string heap.
    ///
    /// The `extern "C"` functions in this module use this heap to allow JS and
    /// Wasm code to pass strings back and forth across the Wasm boundary.
    heap: Heap,
}

impl State {
    /// Convert a boxed state into an opaque, pointer-sized value to pass to
    /// foreign code.
    pub fn into_raw(self: Box<Self>) -> u32 {
        Box::into_raw(self) as u32
    }

    /// Convert an opaque, pointer-sized value back to a boxed state.
    ///
    /// `from_raw` operates on values returned from [`into_raw`].
    ///
    /// [`into_raw`]: Self::into_raw
    ///
    /// # Safety
    ///
    /// `raw` must be the address of a `Box<State>` which was returned from
    /// `State::into_raw`. The state represented by this raw address must not
    /// have been dropped.
    ///
    /// # Panics
    ///
    /// This function panics if the given `raw` is 0 (a null pointer).
    pub unsafe fn from_raw(raw: u32) -> Box<Self> {
        // ensure all `u32` can be converted to a pointer-sized value.
        const _: () = assert!(size_of::<u32>() <= size_of::<*mut State>());

        assert_ne!(raw, 0, "null pointer");
        unsafe { Box::from_raw(raw as *mut State) }
    }
}

#[no_mangle]
#[must_use]
extern "C" fn artichoke_web_repl_init() -> u32 {
    let mut state = Box::<State>::default();
    let build = match Interp::new() {
        Ok(mut interp) => interp
            .metadata()
            .unwrap_or_else(|| String::from("Could not extract interpreter metadata")),
        Err(err) => err.to_string(),
    };
    println!("{build}");
    state.heap.allocate(build);
    state.into_raw()
}

#[no_mangle]
#[must_use]
extern "C" fn artichoke_string_new(state: u32) -> u32 {
    let state = unsafe { State::from_raw(state) };
    let mut state = ManuallyDrop::new(state);
    state.heap.allocate(String::new())
}

#[no_mangle]
extern "C" fn artichoke_string_free(state: u32, ptr: u32) {
    let state = unsafe { State::from_raw(state) };
    let mut state = ManuallyDrop::new(state);
    state.heap.free(ptr);
}

#[no_mangle]
#[must_use]
extern "C" fn artichoke_string_getlen(state: u32, ptr: u32) -> u32 {
    let state = unsafe { State::from_raw(state) };
    let state = ManuallyDrop::new(state);
    state.heap.string_getlen(ptr)
}

#[no_mangle]
#[must_use]
extern "C" fn artichoke_string_getch(state: u32, ptr: u32, idx: u32) -> u8 {
    let state = unsafe { State::from_raw(state) };
    let state = ManuallyDrop::new(state);
    state.heap.string_getch(ptr, idx)
}

#[no_mangle]
extern "C" fn artichoke_string_putch(state: u32, ptr: u32, ch: u8) {
    let state = unsafe { State::from_raw(state) };
    let mut state = ManuallyDrop::new(state);
    state.heap.string_putch(ptr, ch);
}

#[no_mangle]
#[must_use]
extern "C" fn artichoke_eval(state: u32, ptr: u32) -> u32 {
    let state = unsafe { State::from_raw(state) };
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
