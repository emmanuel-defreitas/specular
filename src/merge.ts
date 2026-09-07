/**
 * tailwind-merge config generator.
 *
 * `twMerge("inset-shadow-lit-t-2 inset-shadow-dim-b-1")` with stock
 * tailwind-merge returns `"inset-shadow-dim-b-1"`: every unknown class that
 * shares a prefix with a core group is filed under that group, which holds
 * one `box-shadow`, and only the last survives. Utilities and merge config
 * therefore ship as one artifact from one config.
 *
 * One class group per custom property. Every group displaces core `shadow`
 * and `inset-shadow` and is displaced by them; all-layer groups displace
 * their per-layer twins; and the full N×N cross-surface matrix is generated,
 * because two surfaces on one element means one `box-shadow` wins outright.
 */
import {
  extendTailwindMerge,
  validators,
  type ClassNameValue,
  type ConfigExtension,
  type DefaultClassGroupIds,
  type DefaultThemeGroupIds,
} from "tailwind-merge"

import { LAYER_PROPS, resolveSurfaces, type LayerProp, type Surfaces } from "./index.ts"

/** Template-literal union of every group id, so a typo in a consumer's
 * `conflictingClassGroups` is a compile error. */
export type BezelGroupId<T extends Surfaces> = {
  [S in keyof T & string]:
    | `${S}-base`
    | `${S}-blur`
    | `${S}-spread`
    | { [L in keyof T[S]["layers"] & string]: `${S}-${L}-${LayerProp}` }[keyof T[S]["layers"] & string]
}[keyof T & string]

const { isAny } = validators

export type BezelMergeConfig<T extends Surfaces> = ConfigExtension<DefaultClassGroupIds | BezelGroupId<T>, DefaultThemeGroupIds>

export function mergeConfig<const T extends Surfaces>(surfaces: T): BezelMergeConfig<T> {
  const resolved = resolveSurfaces(surfaces)
  const classGroups: Record<string, unknown[]> = {}
  const conflicts: Record<string, string[]> = {}
  const own = new Map<string, string[]>()

  for (const s of resolved) {
    const ids = [`${s.name}-base`, `${s.name}-blur`, `${s.name}-spread`]
    classGroups[`${s.name}-base`] = [s.baseClass]
    classGroups[`${s.name}-blur`] = [{ [s.name]: [{ blur: [isAny] }] }]
    classGroups[`${s.name}-spread`] = [{ [s.name]: [{ spread: [isAny] }] }]
    for (const l of s.layers) {
      const n = `${s.name}-${l.name}`
      classGroups[`${n}-x`] = [{ [n]: [{ l: [isAny], r: [isAny] }] }]
      classGroups[`${n}-y`] = [{ [n]: [{ t: [isAny], b: [isAny] }] }]
      classGroups[`${n}-blur`] = [{ [n]: [{ blur: [isAny] }] }]
      classGroups[`${n}-spread`] = [{ [n]: [{ spread: [isAny] }] }]
      classGroups[`${n}-color`] = [{ [n]: [{ color: [isAny] }] }]
      // The bare class and its `/40` modifier.
      classGroups[`${n}-alpha`] = [n]
      ids.push(...LAYER_PROPS.map((p) => `${n}-${p}`))
    }
    own.set(s.name, ids)
  }

  const all = [...own.values()].flat()
  for (const s of resolved) {
    const mine = own.get(s.name) ?? []
    const foreign = all.filter((g) => !mine.includes(g))
    for (const g of mine) conflicts[g] = ["shadow", "inset-shadow", ...foreign]
    for (const p of ["blur", "spread"] as const)
      conflicts[`${s.name}-${p}`]?.push(...s.layers.map((l) => `${s.name}-${l.name}-${p}`))
  }
  conflicts.shadow = all
  conflicts["inset-shadow"] = all

  // Built as plain records; the group ids are typed at the boundary.
  return { extend: { classGroups, conflictingClassGroups: conflicts } } as unknown as BezelMergeConfig<T>
}

/**
 * A ready `cn`. Accepts what tailwind-merge accepts: strings, arrays, and
 * falsy values — not clsx's object form. For that, run clsx first:
 * `extendTailwindMerge(mergeConfig(surfaces))(clsx(...))`.
 */
export function createCn<const T extends Surfaces>(surfaces: T) {
  const merge = extendTailwindMerge<BezelGroupId<T>>(mergeConfig(surfaces))
  return (...inputs: ClassNameValue[]): string => merge(...inputs)
}
