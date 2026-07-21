import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import type { RepositorioDePecas } from '../../dominio/repositorios/repositorio-de-pecas.js'
import type { Peca } from '../../dominio/entidades/peca.js'
import { paraDTO, type PecaDTO } from '../dtos.js'

export interface EntradaAtualizarPeca {
  id: string
  nome?: string
  descricao?: string | null
  preco?: number
}

/** Atualiza os dados cadastrais (nome, descrição, preço) de uma peça. */
export class AtualizarPeca implements CasoDeUso<EntradaAtualizarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaAtualizarPeca): Promise<PecaDTO> {
    const peca = await this.buscar(entrada.id)
    peca.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: entrada.preco !== undefined ? Dinheiro.deReais(entrada.preco) : undefined,
    })
    await this.repositorio.salvar(peca)
    return paraDTO(peca)
  }

  private async buscar(id: string): Promise<Peca> {
    const peca = await this.repositorio.buscarPorId(id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', id)
    }
    return peca
  }
}
