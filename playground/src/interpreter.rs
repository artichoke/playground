use artichoke_backend::eval::{Context, Eval};
use artichoke_backend::Artichoke;
use artichoke_core::value::Value;

use crate::meta;
use crate::string::Heap;
use crate::web;

#[derive(Default, Debug, Clone)]
pub struct State {
    pub heap: Heap,
}

pub struct Interp(Option<Artichoke>);

impl Interp {
    pub fn new() -> Self {
        let interp = match artichoke_backend::interpreter() {
            Ok(interp) => interp,
            Err(err) => {
                eprintln!("{:?}", err);
                panic!("Could not initialize interpreter");
            }
        };
        web::init(&interp).unwrap();
        interp.0.borrow_mut().capture_output();
        interp.push_context(Context::new(crate::REPL_FILENAME));
        Self(Some(interp))
    }

    pub fn build_meta() -> String {
        let interp = Self::new();
        if let Some(ref interp) = interp.0 {
            meta::build_info(&interp)
        } else {
            "Could not extract build meta".to_owned()
        }
    }

    pub fn eval(&self, code: &[u8]) -> String {
        if let Some(ref interp) = self.0 {
            match interp.eval(code) {
                Ok(value) => format!("=> {}", value.inspect()),
                Err(err) => err.to_string(),
            }
        } else {
            "".to_owned()
        }
    }

    pub fn captured_output(&self) -> String {
        if let Some(ref interp) = self.0 {
            interp.0.borrow_mut().get_and_clear_captured_output()
        } else {
            "".to_owned()
        }
    }
}

impl Drop for Interp {
    fn drop(&mut self) {
        if let Some(interp) = self.0.take() {
            interp.close();
        }
    }
}
