import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDePecas } from '../../dominio/repositorios/repositorio-de-pecas.js'
import { Peca } from '../../dominio/entidades/peca.js'
import { QuantidadeEstoque } from '../../dominio/objetos-de-valor/quantidade-estoque.js'
import { paraDTO, type PecaDTO } from '../dtos.js'

export interface EntradaCriarPeca {
  nome: string
  descricao?: string | null
  preco: number
  quantidadeEstoque: number
  estoqueMinimo?: number
}

/** Cadastra uma peça no estoque com preço e quantidade inicial. */
export class CriarPeca implements CasoDeUso<EntradaCriarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaCriarPeca): Promise<PecaDTO> {
    const peca = Peca.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: Dinheiro.deReais(entrada.preco),
      quantidadeEstoque: QuantidadeEstoque.criar(entrada.quantidadeEstoque),
      estoqueMinimo: entrada.estoqueMinimo,
    })
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}
