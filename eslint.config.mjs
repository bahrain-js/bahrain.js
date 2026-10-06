// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // tools/ holds vendored Agentic Workflow scripts (overwritten by /agentic-workflow:sync)
  ignores: ['tools/**']
}, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn'
  }
})
