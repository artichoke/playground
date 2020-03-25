use artichoke_backend::{Artichoke, Eval, ValueLike as Value};

pub fn build_info(interp: &mut Artichoke) -> String {
    let mut description = interp
        .eval(b"RUBY_DESCRIPTION")
        .and_then(Value::try_into::<String>)
        .unwrap_or_default();
    let compiler = interp
        .eval(b"ARTICHOKE_COMPILER_VERSION")
        .and_then(Value::try_into::<&str>)
        .unwrap_or_default();
    description.push('\n');
    description.push('[');
    description.push_str(compiler);
    description.push(']');
    description
}
