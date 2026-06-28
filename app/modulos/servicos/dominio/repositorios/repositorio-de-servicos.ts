import { Servico } from '../entidades/servico.js'

export interface RepositorioDeServicos {
  salvar(servico: Servico): Promise<void>
  buscarPorId(id: string): Promise<Servico | null>
  buscarVarios(ids: string[]): Promise<Servico[]>
  listar(): Promise<Servico[]>
  remover(id: string): Promise<void>
}
