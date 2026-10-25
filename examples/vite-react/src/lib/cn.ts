/**
 * `cn()` built from the same surfaces the plugin compiles. Stock tailwind-merge
 * files `bezel-lit-t-2` under the core `shadow` group and would drop it in
 * favour of `bezel-dim-b-1`; `createCn` knows every utility the plugin emits.
 */
import { createCn } from "@exegia/specular/merge"

import { surfaces } from "../../specular.config.ts"

export const cn = createCn(surfaces)
