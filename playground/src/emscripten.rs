#![cfg(target_os = "emscripten")]
#![allow(dead_code)]
#![allow(trivial_casts)]
#![allow(unused_imports)]

// taken from https://github.com/Gigoteur/PX8/blob/master/src/px8/emscripten.rs
// taken from https://github.com/gliheng/rust-wasm/blob/d89a71f4a68101c7b4e2944973b39a2c20b21ebe/sdl2-drag/src/emscripten.rs

use std::cell::RefCell;
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_float, c_int, c_void};
use std::ptr::null_mut;

#[allow(non_camel_case_types)]
type em_callback_func = unsafe extern "C" fn();

extern "C" {
    // void emscripten_set_main_loop(em_callback_func func, int fps, int simulate_infinite_loop)
    pub fn emscripten_set_main_loop(
        func: em_callback_func,
        fps: c_int,
        simulate_infinite_loop: c_int,
    );

    pub fn emscripten_cancel_main_loop();
    pub fn emscripten_pause_main_loop();
    pub fn emscripten_get_now() -> c_float;
}

thread_local!(static MAIN_LOOP_CALLBACK: RefCell<*mut c_void> = RefCell::new(null_mut()));

pub fn set_main_loop_callback<F>(callback: F)
where
    F: FnMut(),
{
    MAIN_LOOP_CALLBACK.with(|log| {
        *log.borrow_mut() = &callback as *const _ as *mut c_void;
    });

    unsafe {
        emscripten_set_main_loop(wrapper::<F>, -1, 1);
    }

    unsafe extern "C" fn wrapper<F>()
    where
        F: FnMut(),
    {
        MAIN_LOOP_CALLBACK.with(|z| {
            let closure = *z.borrow_mut() as *mut F;
            (*closure)();
        });
    }
}
