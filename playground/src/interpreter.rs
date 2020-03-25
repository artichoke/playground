use artichoke_backend::exception::Exception;
use artichoke_backend::state::output::Captured;
use artichoke_backend::state::parser::Context;
use artichoke_backend::string;
use artichoke_backend::value::Value;
use artichoke_backend::{Artichoke, Eval, Parser, ValueLike};
use std::fmt;
use std::mem;

use crate::meta;
use crate::string::Heap;
use crate::web;

#[derive(Default, Debug, Clone)]
pub struct State {
    pub heap: Heap,
}

pub struct EvalResult {
    pub result: Result<Value, Exception>,
    pub output: Captured,
}

impl EvalResult {
    fn new(result: Result<Value, Exception>, output: Captured) -> Self {
        Self { result, output }
    }
}

impl fmt::Display for EvalResult {
    fn fmt(&self, mut f: &mut fmt::Formatter<'_>) -> fmt::Result {
        string::format_unicode_debug_into(&mut f, self.output.stdout())
            .map_err(string::WriteError::into_inner)?;
        if !self.output.stderr().is_empty() {
            writeln!(f, "--- stderr:")?;
            string::format_unicode_debug_into(&mut f, self.output.stderr())
                .map_err(string::WriteError::into_inner)?;
        }
        match self.result.as_ref() {
            Ok(value) => {
                write!(f, "=> ")?;
                string::format_unicode_debug_into(&mut f, &value.inspect())
                    .map_err(string::WriteError::into_inner)?;
            }
            Err(exc) => write!(f, "{}", exc)?,
        }
        Ok(())
    }
}

pub struct Interp(Option<Artichoke>);

impl Interp {
    pub fn new() -> Self {
        let mut interp = match artichoke_backend::interpreter() {
            Ok(interp) => interp,
            Err(err) => {
                eprintln!("{:?}", err);
                panic!("Could not initialize interpreter");
            }
        };
        if let Err(err) = web::init(&mut interp) {
            eprintln!("{:?}", err);
            panic!("Could not initialize interpreter");
        }
        interp.push_context(unsafe { Context::new_unchecked(crate::REPL_FILENAME) });
        Self(Some(interp))
    }

    pub fn build_meta() -> String {
        let mut interp = Self::new();
        if let Some(ref mut interp) = interp.0 {
            meta::build_info(interp)
        } else {
            String::from("Could not extract build meta")
        }
    }

    pub fn eval(&mut self, code: &[u8]) -> Option<EvalResult> {
        if let Some(ref mut interp) = self.0 {
            let result = interp.eval(code);
            let output = mem::replace(&mut interp.0.borrow_mut().output, Captured::new());
            Some(EvalResult::new(result, output))
        } else {
            None
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
