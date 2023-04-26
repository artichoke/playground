//! Wrappers around [`artichoke::Artichoke`] for the playground.

use std::ffi::OsStr;
use std::fmt;
use std::mem;
use std::path::Path;
use std::str;

use bstr::ByteSlice;

use artichoke::backend::ffi::InterpreterExtractError;
use artichoke::backend::state::output::Captured;
use artichoke::backend::state::parser::Context;
use artichoke::backend::value;
use artichoke::prelude::*;
use scolapasta_string_escape::format_debug_escape_into;

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
    ///
    /// # Errors
    ///
    /// If the provided writer returns an error, this function will return it.
    pub fn to_report<W>(&self, mut f: W, interp: &mut Artichoke) -> fmt::Result
    where
        W: fmt::Write,
    {
        let Self { result, output } = self;

        for line in output.stdout().lines() {
            if let Ok(line) = str::from_utf8(line) {
                f.write_str(line)?;
            } else {
                format_debug_escape_into(&mut f, line)?;
            }
            f.write_str("\n")?;
        }

        if !output.stderr().is_empty() {
            f.write_str("--- stderr:")?;
            for line in output.stderr().lines() {
                if let Ok(line) = str::from_utf8(line) {
                    f.write_str(line)?;
                } else {
                    format_debug_escape_into(&mut f, line)?;
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
                        format_debug_escape_into(&mut f, line)?;
                    }
                    f.write_str("\n")?;
                }
            }
            Err(exc) => write!(f, "{exc}")?,
        }

        Ok(())
    }
}

/// Auto-closing Ruby interpreter.
///
/// See [`Artichoke`] for more details.
///
/// This wrapper implements [`Eval`] from artichoke-core.
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

    /// Retrieve information about the current Artichoke build.
    ///
    /// See [`build_info`] for more details.
    ///
    /// [`build_info`]: meta::build_info
    pub fn metadata(&mut self) -> Option<String> {
        self.0.as_mut().map(meta::build_info)
    }

    /// Construct a string report from the raw output of an interpreter eval.
    ///
    /// See [`Reporter`] for more details.
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

    /// Eval a byte string on and [`Artichoke`] interpreter.
    ///
    /// # Errors
    ///
    /// If an exception occurs when running the provided Ruby code, an error is
    /// returned.
    ///
    /// For other possible failures, see [`Artichoke::eval`].
    fn eval(&mut self, code: &[u8]) -> Result<Self::Value, Self::Error> {
        let interp = self.0.as_mut().ok_or_else(InterpreterExtractError::new)?;
        interp.eval(code)
    }

    /// This operation is not supported in the playground.
    fn eval_os_str(&mut self, _code: &OsStr) -> Result<Self::Value, Self::Error> {
        let exc = NotImplementedError::from("Evaling &OsStr is not supported on the web");
        Err(exc.into())
    }

    /// This operation is not supported in the playground.
    fn eval_file(&mut self, _file: &Path) -> Result<Self::Value, Self::Error> {
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
