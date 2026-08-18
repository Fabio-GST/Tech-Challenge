import app from '@adonisjs/core/services/app'

/**
 * Resolve um caso de uso (ou outro binding) do container IoC nos testes,
 * exatamente como os controllers recebem em produção.
 */
export function fazer<T>(token: new (...args: never[]) => T): Promise<T> {
  return app.container.make(token)
}
