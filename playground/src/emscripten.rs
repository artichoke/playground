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
    /// Set a C function as the main event loop for the calling thread.
    ///
    /// There can be only one main loop function at a time, per thread. To change
    /// the main loop function, first [`cancel`] the current loop, and then call
    /// this function to set another.
    ///
    /// The upstream documentation recommends setting `fps` to 0 or a negative
    /// value, which will cause emscripten to use the browser-native
    /// `requestAnimationFrame` mechanism to call the main loop function. Per
    /// upstream:
    ///
    /// > This is **HIGHLY** recommended if you are doing rendering, as the
    /// > browser's `requestAnimationFrame` will make sure you render at a
    /// > proper smooth rate that lines up properly with the browser and
    /// > monitor.
    ///
    /// See the emscripten docs for [`emscripten_set_main_loop`][upstream-docs].
    ///
    /// # Header Declaration
    ///
    /// ```c
    /// void emscripten_set_main_loop(em_callback_func func, int fps, int simulate_infinite_loop)
    /// ```
    ///
    /// [`cancel`]: emscripten_cancel_main_loop
    /// [upstream-docs]: https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop
    fn emscripten_set_main_loop(func: em_callback_func, fps: c_int, simulate_infinite_loop: c_int);

    /// Cancels the main event loop for the calling thread.
    ///
    /// See also [`emscripten_set_main_loop`] for information about setting and
    /// using the main loop.
    ///
    /// See the emscripten docs for [`emscripten_cancel_main_loop`][upstream-docs].
    ///
    /// # Header Declaration
    ///
    /// ```c
    /// void emscripten_cancel_main_loop(void)
    /// ```
    ///
    /// [upstream-docs]: https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_cancel_main_loop
    fn emscripten_cancel_main_loop();
}

thread_local! {
    /// Storage for the main loop callback run on the emscripten event loop.
    ///
    /// This thread local is used to store a boxed closure which can be accessed
    /// via an injected 0-argument `extern "C" fn` passed to emscripten.
    static MAIN_LOOP_CALLBACK: RefCell<Option<Box<dyn FnMut() + 'static>>> = RefCell::new(None);
}

unsafe extern "C" fn wrapper() {
    MAIN_LOOP_CALLBACK.with(|z| {
        if let Some(main_loop) = &mut *z.borrow_mut() {
            main_loop();
        }
    });
}

/// Set the given callback as the emscripten main loop callback.
///
/// There can be only one main loop function at a time, per thread. If this
/// function has been previously called, it will first cancel the current
/// emscripten main loop before installing the given one.
///
/// See the emscripten docs on the [browser main loop]. This function is
/// implemented with native bindings to the emscripten C APIs
/// [`emscripten_set_main_loop`][docs-set] and
/// [`emscripten_cancel_main_loop`][docs-cancel].
///
/// [browser main loop]: https://emscripten.org/docs/porting/emscripten-runtime-environment.html#browser-main-loop
/// [docs-set]: https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_set_main_loop
/// [docs-cancel]: https://emscripten.org/docs/api_reference/emscripten.h.html#c.emscripten_cancel_main_loop
pub fn set_main_loop_callback<F>(callback: F)
where
    F: FnMut() + 'static,
{
    let previous_callback = MAIN_LOOP_CALLBACK.with(|z| z.borrow_mut().replace(Box::new(callback)));

    // If the thead local state previously contained a callback, that means
    // `set_main_loop_callback` (and thus `emscripten_set_main_loop`) has been
    // called once before on this thread.
    //
    // Per the docs for `emscripten_set_main_loop`, this constitutes changing
    // the main loop function, which first requires a call to `
    if previous_callback.is_some() {
        unsafe {
            emscripten_cancel_main_loop();
        }
    }

    unsafe {
        emscripten_set_main_loop(wrapper, -1, true.into());
    }
}
