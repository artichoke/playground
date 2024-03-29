use artichoke::prelude::{Value as _, *};

pub fn build_info(interp: &mut Artichoke) -> String {
    let mut description = interp
        .eval(b"RUBY_DESCRIPTION")
        .and_then(|value| value.try_into_mut::<String>(interp))
        .unwrap_or_default();
    let compiler = interp
        .eval(b"ARTICHOKE_COMPILER_VERSION")
        .and_then(|value| value.try_into_mut::<&str>(interp))
        .unwrap_or_default();
    description.push('\n');
    description.push('[');
    description.push_str(compiler);
    description.push(']');
    description
}

#[cfg(test)]
mod tests {
    use super::build_info;

    #[test]
    fn build_meta_contents() {
        let mut interp = artichoke::interpreter().unwrap();
        let meta = build_info(&mut interp);
        assert!(meta.starts_with("artichoke 0.1.0-pre.0 ("));
        assert_eq!(meta.lines().count(), 2);
        let compiler_meta = meta.lines().nth(1).unwrap();
        assert!(compiler_meta.starts_with("[rustc 1.54.0 (a178d0322 2021-07-26) on "));
    }
}
