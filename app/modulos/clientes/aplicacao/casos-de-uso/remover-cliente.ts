import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import type { RepositorioDeClientes } from '../../dominio/repositorios/repositorio-de-clientes.js'

/** Remove um cliente pelo identificador. */
export class RemoverCliente implements CasoDeUso<string, void> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(id: string): Promise<void> {
    const cliente = await this.repositorio.buscarPorId(id)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', id)
    }
    await this.repositorio.remover(id)
  }
}
