//! FFI bindings to emscripten web APIs.

// This source is adapted from https://github.com/gliheng/rust-wasm as of
// commit d89a71f4a68101c7b4e2944973b39a2c20b21ebe.
//
// The file is licensed with the MIT License Copyright (c) 2017 Amadeus.
//
// See:
//
// - https://github.com/gliheng/rust-wasm/blob/d89a71f4a68101c7b4e2944973b39a2c20b21ebe/sdl2-drag/src/emscripten.rs
// - https://github.com/gliheng/rust-wasm/blob/d89a71f4a68101c7b4e2944973b39a2c20b21ebe/LICENSE

use std::cell::RefCell;
use std::os::raw::c_int;

#[allow(non_camel_case_types)]
type em_callback_func = unsafe extern "C" fn();

extern "C" {
    // Set a C function as the main event loop for the calling thread.
    //
    // See the emscripten docs for [`emscripten_set_main_loop`][upstream-docs].
    //
    // # Header Declaration
    //
    // ```c
    // void emscripten_set_main_loop(em_callback_func func, int fps, int simulate_infinite_loop)
    // ```
    //
    // [upstream-docs]: https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop
    fn emscripten_set_main_loop(func: em_callback_func, fps: c_int, simulate_infinite_loop: c_int);
}

thread_local!(static MAIN_LOOP_CALLBACK: RefCell<Option<Box<dyn FnMut()>>> = RefCell::new(None));

unsafe extern "C" fn wrapper() {
    MAIN_LOOP_CALLBACK.with(|z| {
        if let Some(main_loop) = &mut *z.borrow_mut() {
            main_loop();
        }
    });
}

/// Set the given callback as the emscripten main loop callback.
///
/// See the emscripten docs on the [browser main loop].
///
/// [browser main loop]: https://emscripten.org/docs/porting/emscripten-runtime-environment.html#browser-main-loop
pub fn set_main_loop_callback<F>(callback: F)
where
    F: FnMut() + 'static,
{
    MAIN_LOOP_CALLBACK.with(|z| {
        z.borrow_mut().replace(Box::new(callback));
    });

    unsafe {
        emscripten_set_main_loop(wrapper, -1, 1);
    }
}
