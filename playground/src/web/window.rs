use artichoke_backend::convert::RustBackedValue;
use artichoke_backend::extn::core::exception::{self, Fatal};
use artichoke_backend::sys;

use crate::web::location::Location;

pub struct Window;

impl Window {
    pub unsafe extern "C" fn location(
        mrb: *mut sys::mrb_state,
        _slf: sys::mrb_value,
    ) -> sys::mrb_value {
        let interp = unwrap_interpreter!(mrb);
        let result = Location(String::from("phantom")).try_into_ruby(&interp, None);
        match result {
            Ok(value) => value.inner(),
            Err(err) => {
                let exception = Box::new(Fatal::new(
                    &interp,
                    format!("Failed to serialize Rust Location into Ruby: {}", err),
                ));
                exception::raise(interp, exception)
            }
        }
    }
}

impl RustBackedValue for Window {
    fn ruby_type_name() -> &'static str {
        "Artichoke::Web::Window"
    }
}
