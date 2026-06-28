import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  rules: {
    /**
     * Os arquivos das camadas de domínio/aplicação usam kebab-case (convenção
     * adotada no projeto para DDD); os arquivos gerenciados pelo Adonis (models,
     * controllers, middleware) permanecem em snake_case. Permitimos ambos.
     */
    '@unicorn/filename-case': ['error', { cases: { snakeCase: true, kebabCase: true } }],
  },
})
