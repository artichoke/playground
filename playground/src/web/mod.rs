use artichoke_backend::def::{rust_data_free, ClassLike, Define, EnclosingRubyScope};
use artichoke_backend::eval::Eval;
use artichoke_backend::extn::core::artichoke::RArtichoke;
use artichoke_backend::file::File;
use artichoke_backend::load::LoadSources;
use artichoke_backend::sys;
use artichoke_backend::{Artichoke, ArtichokeError};

mod location;
mod window;

use location::Location;
use window::Window;

pub fn init(interp: &Artichoke) -> Result<(), ArtichokeError> {
    interp.def_file_for_type::<_, Web>("artichoke-web.rb")?;
    interp.def_file_for_type::<_, Web>("artichoke/web.rb")?;
    Ok(())
}

struct Web;

impl File for Web {
    fn require(interp: Artichoke) -> Result<(), ArtichokeError> {
        let scope = interp
            .0
            .borrow_mut()
            .module_spec::<RArtichoke>()
            .map(EnclosingRubyScope::module)
            .ok_or(ArtichokeError::New)?;
        let web = interp.0.borrow_mut().def_module::<Self>("Web", Some(scope));
        web.borrow().define(&interp)?;
        let scope = interp
            .0
            .borrow_mut()
            .module_spec::<Self>()
            .map(EnclosingRubyScope::module)
            .ok_or(ArtichokeError::New)?;
        let window = interp
            .0
            .borrow_mut()
            .def_module::<Window>("Window", Some(scope));
        window
            .borrow_mut()
            .add_self_method("location", Window::location, sys::mrb_args_none());
        window
            .borrow_mut()
            .add_method("location", Window::location, sys::mrb_args_none());
        window.borrow().define(&interp)?;
        let scope = interp
            .0
            .borrow_mut()
            .module_spec::<Self>()
            .map(EnclosingRubyScope::module)
            .ok_or(ArtichokeError::New)?;
        let location = interp.0.borrow_mut().def_class::<Location>(
            "Location",
            Some(scope),
            Some(rust_data_free::<Location>),
        );
        location
            .borrow_mut()
            .add_self_method("hash", Location::hash, sys::mrb_args_none());
        location
            .borrow_mut()
            .add_method("hash", Location::hash, sys::mrb_args_none());
        location.borrow().define(&interp)?;
        interp.eval(&include_bytes!("web.rb")[..])?;
        Ok(())
    }
}
