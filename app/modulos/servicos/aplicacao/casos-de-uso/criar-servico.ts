import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDeServicos } from '../../dominio/repositorios/repositorio-de-servicos.js'
import { Servico } from '../../dominio/entidades/servico.js'
import { paraDTO, type ServicoDTO } from '../dtos.js'

export interface EntradaCriarServico {
  nome: string
  descricao?: string | null
  preco: number
  tempoEstimadoMinutos?: number | null
}

/** Cadastra um novo serviço no catálogo da oficina. */
export class CriarServico implements CasoDeUso<EntradaCriarServico, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(entrada: EntradaCriarServico): Promise<ServicoDTO> {
    const servico = Servico.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: Dinheiro.deReais(entrada.preco),
      tempoEstimadoMinutos: entrada.tempoEstimadoMinutos,
    })
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}
