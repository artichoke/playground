use artichoke_backend::convert::RustBackedValue;
use artichoke_backend::exception;
use artichoke_backend::extn::core::exception::Fatal;
use artichoke_backend::sys;
use artichoke_backend::ConvertMut;
use stdweb::web;

pub struct Location(pub String);

impl Location {
    pub unsafe extern "C" fn hash(
        mrb: *mut sys::mrb_state,
        _slf: sys::mrb_value,
    ) -> sys::mrb_value {
        let mut interp = unwrap_interpreter!(mrb);
        let result = web::window().location().map(|location| location.hash());
        match result {
            Some(Ok(value)) => interp.convert_mut(value).inner(),
            Some(Err(_)) => {
                let exception = Fatal::new(&interp, "SecurityError");
                exception::raise(interp, exception)
            }
            None => {
                let exception = Fatal::new(&interp, "No location");
                exception::raise(interp, exception)
            }
        }
    }
}

impl RustBackedValue for Location {
    fn ruby_type_name() -> &'static str {
        "Artichoke::Web::Location"
    }
}
