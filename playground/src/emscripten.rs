#![cfg(target_os = "emscripten")]

// taken from https://github.com/Gigoteur/PX8/blob/master/src/px8/emscripten.rs
// taken from https://github.com/gliheng/rust-wasm/blob/d89a71f4a68101c7b4e2944973b39a2c20b21ebe/sdl2-drag/src/emscripten.rs

use std::cell::RefCell;
use std::os::raw::c_int;

#[allow(non_camel_case_types)]
type em_callback_func = unsafe extern "C" fn();

extern "C" {
    // void emscripten_set_main_loop(em_callback_func func, int fps, int simulate_infinite_loop)
    fn emscripten_set_main_loop(func: em_callback_func, fps: c_int, simulate_infinite_loop: c_int);
}

thread_local!(static MAIN_LOOP_CALLBACK: RefCell<Option<Box<dyn FnMut()>>> = RefCell::new(None));

unsafe extern "C" fn wrapper() {
    MAIN_LOOP_CALLBACK.with(|z| {
        if let Some(ref mut main_loop) = &mut *z.borrow_mut() {
            main_loop();
        }
    });
}

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
