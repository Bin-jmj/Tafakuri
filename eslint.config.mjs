// ESLint flat config. eslint-config-next 16 is flat-config native: its
// root export already includes the React, react-hooks, @next/next and
// jsx-a11y rules plus the TypeScript parser, and global ignores.
import next from "eslint-config-next"

const eslintConfig = [
  ...next,
  {
    // react-hooks v6 ships with the new React-Compiler-era strictness.
    // set-state-in-effect flags the codebase's pre-existing "load data on
    // mount" effects (bookmarks, reading progress, admin pickers, etc.).
    // Those are legitimate external-system synchronizations, and migrating
    // them all (e.g. to suspense/queries) is its own project - so surface
    // them as warnings until then instead of failing every build.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "next-env.d.ts", "public/sw.js", "docs/**"],
  },
]

export default eslintConfig
