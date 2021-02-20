use artichoke::backend::state::output::Captured;
use artichoke::backend::state::parser::Context;
use artichoke::backend::string::{format_unicode_debug_into, WriteError};
use artichoke::backend::value;
use artichoke::prelude::*;
use bstr::ByteSlice;
use std::ffi::OsStr;
use std::fmt;
use std::mem;
use std::path::Path;
use std::str;

use crate::meta;

/// Convert a Ruby interpreter invocation into a displayable report.
///
/// This struct produces output suitable for displaying in the playground
/// webapp.
#[derive(Debug)]
pub struct Reporter<T> {
    /// The output from [`Artichoke::eval`].
    pub result: Result<T, Error>,
    /// The captured stdout and stderr of the interpreter.
    pub output: Captured,
}

impl<T> Reporter<T>
where
    T: Value<Artichoke = Artichoke>,
{
    /// Coalesce stdout, stderr, and `returned_value.inspect` into an output
    /// report suitable for displaying in the playground webapp.
    fn to_report<W>(&self, mut f: W, interp: &mut Artichoke) -> fmt::Result
    where
        W: fmt::Write,
    {
        let Self { result, output } = self;

        for line in output.stdout().lines() {
            if let Ok(line) = str::from_utf8(line) {
                f.write_str(line)?;
            } else {
                format_unicode_debug_into(&mut f, line).map_err(WriteError::into_inner)?;
            }
            f.write_str("\n")?;
        }

        if !output.stderr().is_empty() {
            f.write_str("--- stderr:")?;
            for line in output.stderr().lines() {
                if let Ok(line) = str::from_utf8(line) {
                    f.write_str(line)?;
                } else {
                    format_unicode_debug_into(&mut f, line).map_err(WriteError::into_inner)?;
                }
                f.write_str("\n")?;
            }
        }

        match result {
            Ok(value) => {
                f.write_str("=> ")?;
                let value_debug = value.inspect(interp);
                for line in value_debug.lines() {
                    if let Ok(line) = str::from_utf8(line) {
                        f.write_str(line)?;
                    } else {
                        format_unicode_debug_into(&mut f, line).map_err(WriteError::into_inner)?;
                    }
                    f.write_str("\n")?;
                }
            }
            Err(exc) => write!(f, "{}", exc)?,
        }

        Ok(())
    }
}

/// Auto-closing Ruby interpreter.
#[derive(Debug)]
pub struct Interp(Option<Artichoke>);

impl Interp {
    /// Construct a new Artichoke interpreter.
    ///
    /// # Errors
    ///
    /// If the interpreter fails to initialize, an error is returned. See
    /// [`artichoke::interpreter`].
    ///
    /// If this method fails to set the context filename, an error is returned.
    pub fn new() -> Result<Self, Error> {
        let mut interp = artichoke::interpreter()?;
        interp.push_context(unsafe { Context::new_unchecked(crate::REPL_FILENAME) })?;
        Ok(Self(Some(interp)))
    }

    pub fn metadata(&mut self) -> Option<String> {
        self.0.as_mut().map(meta::build_info)
    }

    pub fn eval_to_report(&mut self, code: &[u8]) -> Option<String> {
        let result = self.eval(code);
        if let Some(ref mut interp) = self.0 {
            let state = interp.state.as_mut()?;
            let output = mem::replace(&mut state.output, Captured::new());

            let reporter = Reporter { result, output };
            let mut report = String::new();
            reporter.to_report(&mut report, interp).ok()?;
            Some(report)
        } else {
            None
        }
    }
}

impl Eval for Interp {
    type Value = value::Value;
    type Error = Error;

    fn eval(&mut self, code: &[u8]) -> Result<Self::Value, Self::Error> {
        use artichoke::backend::ffi::InterpreterExtractError;

        let interp = self.0.as_mut().ok_or_else(InterpreterExtractError::new)?;
        interp.eval(code)
    }

    fn eval_os_str(&mut self, code: &OsStr) -> Result<Self::Value, Self::Error> {
        let _ = code;
        let exc = NotImplementedError::from("Evaling &OsStr is not supported on the web");
        Err(exc.into())
    }

    fn eval_file(&mut self, file: &Path) -> Result<Self::Value, Self::Error> {
        let _ = file;
        let exc =
            NotImplementedError::from("Evaling sources from files is not supported on the web");
        Err(exc.into())
    }
}

impl Drop for Interp {
    fn drop(&mut self) {
        if let Some(interp) = self.0.take() {
            interp.close();
        }
    }
}
