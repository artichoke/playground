use artichoke_backend::eval::Eval;
use artichoke_backend::Artichoke;
use artichoke_core::value::Value;

pub fn build_info(interp: &Artichoke) -> String {
    let description = interp
        .eval("RUBY_DESCRIPTION")
        .and_then(Value::try_into::<&str>)
        .unwrap_or_default();
    let compiler = interp
        .eval("ARTICHOKE_COMPILER_VERSION")
        .and_then(Value::try_into::<&str>)
        .unwrap_or_default();
    format!("{}\n[{}]", description, compiler)
}
