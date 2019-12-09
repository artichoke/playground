use artichoke_backend::class;
use artichoke_backend::def::{self, EnclosingRubyScope};
use artichoke_backend::extn::core::artichoke;
use artichoke_backend::module;
use artichoke_backend::sys;
use artichoke_backend::{Artichoke, ArtichokeError};
use artichoke_core::eval::Eval;
use artichoke_core::file::File;
use artichoke_core::load::LoadSources;

mod location;
mod window;

use location::Location;
use window::Window;

pub fn init(interp: &Artichoke) -> Result<(), ArtichokeError> {
    interp.def_file_for_type::<Web>(b"artichoke-web.rb")?;
    interp.def_file_for_type::<Web>(b"artichoke/web.rb")?;
    Ok(())
}

struct Web;

impl File for Web {
    type Artichoke = Artichoke;

    fn require(interp: &Artichoke) -> Result<(), ArtichokeError> {
        let scope = interp
            .0
            .borrow_mut()
            .module_spec::<artichoke::Artichoke>()
            .map(EnclosingRubyScope::module)
            .ok_or(ArtichokeError::New)?;
        let web = module::Spec::new("Web", Some(scope));
        module::Builder::for_spec(interp, &web).define()?;
        let scope = EnclosingRubyScope::module(&web);
        let window = module::Spec::new("Window", Some(scope));
        module::Builder::for_spec(interp, &window)
            .add_self_method("location", Window::location, sys::mrb_args_none())
            .add_method("location", Window::location, sys::mrb_args_none())
            .define()?;
        let scope = EnclosingRubyScope::module(&web);
        let location = class::Spec::new(
            "Location",
            Some(scope),
            Some(def::rust_data_free::<Location>),
        );
        class::Builder::for_spec(interp, &location)
            .add_self_method("hash", Location::hash, sys::mrb_args_none())
            .add_method("hash", Location::hash, sys::mrb_args_none())
            .define()?;
        interp.0.borrow_mut().def_module::<Self>(web);
        interp.0.borrow_mut().def_module::<Window>(window);
        interp.0.borrow_mut().def_class::<Location>(location);
        interp.eval(&include_bytes!("web.rb")[..])?;
        Ok(())
    }
}
