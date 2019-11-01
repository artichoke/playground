#!/usr/bin/env bash

# rg --no-line-number --no-filename -g '*.h' 'MRB_API .* (mrb_[a-z0-9_]+?)\(.+\);' artichoke-backend/vendor/mruby/include/ -r '$1' | sort | uniq
mrb_api=()

# rg --no-line-number --no-filename -g '*.h' 'MRB_API .* (artichoke_[a-z0-9_]+?)\(.+\);' artichoke-backend/mruby-sys/include/ -r '$1' | sort | uniq
# rg --no-line-number --no-filename -g '*.h' 'MRB_API .* (mrb_[a-z0-9_]+?)\(.+\);' artichoke-backend/mruby-sys/include/ -r '$1' | sort | uniq
artichoke_exports=()

playground_exports=(
  '"_main"'
  '"_artichoke_web_repl_init"'
  '"_artichoke_string_new"'
  '"_artichoke_string_free"'
  '"_artichoke_string_getlen"'
  '"_artichoke_string_getch"'
  '"_artichoke_string_putch"'
  '"_artichoke_eval"'
)

join_by() {
  local IFS="$1"
  shift
  echo "$*"
}

declare -a api_parts
api_parts=()
if [ ${#mrb_api[@]} -gt 0 ]; then
  api_parts+=("$(join_by ",", "${mrb_api[@]}")")
fi
if [ ${#artichoke_exports[@]} -gt 0 ]; then
  api_parts+=("$(join_by ",", "${artichoke_exports[@]}")")
fi
if [ ${#playground_exports[@]} -gt 0 ]; then
  api_parts+=("$(join_by ",", "${playground_exports[@]}")")
fi
exported_functions="$(join_by "," "${api_parts[@]}")"

link_args=(
  -s "WASM=1"
  -s "ASSERTIONS=1"
  -s "NO_EXIT_RUNTIME=1"
  -s "ALLOW_MEMORY_GROWTH=1"
  -s "ENVIRONMENT=web"
  -s "EXPORTED_FUNCTIONS=[$exported_functions]"
  -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall","cwrap"]'
)

declare -a rustc_linker_flags
rustc_linker_flags=()
for flag in "${link_args[@]}"; do
  rustc_linker_flags+=("-C")
  rustc_linker_flags+=("link-arg=$flag")
done

RUSTFLAGS="${rustc_linker_flags[*]}"
export RUSTFLAGS

echo "Building with RUSTFLAGS=$RUSTFLAGS"
