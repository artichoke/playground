use artichoke_backend::Artichoke;
use artichoke_core::eval::Eval;
use artichoke_core::value::Value;

pub fn build_info(interp: &Artichoke) -> String {
    let description = interp
        .eval(b"RUBY_DESCRIPTION")
        .and_then(Value::try_into::<&str>)
        .unwrap_or_default();
    let compiler = interp
        .eval(b"ARTICHOKE_COMPILER_VERSION")
        .and_then(Value::try_into::<&str>)
        .unwrap_or_default();
    format!("{}\n[{}]", description, compiler)
}
