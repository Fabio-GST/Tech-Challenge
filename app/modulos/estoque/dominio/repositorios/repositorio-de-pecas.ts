import { Peca } from '../entidades/peca.js'

export interface RepositorioDePecas {
  salvar(peca: Peca): Promise<void>
  buscarPorId(id: string): Promise<Peca | null>
  buscarVarias(ids: string[]): Promise<Peca[]>
  listar(): Promise<Peca[]>
  remover(id: string): Promise<void>
}
