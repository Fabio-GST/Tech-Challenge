import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDeServicos } from '../../dominio/repositorios/repositorio-de-servicos.js'
import { paraDTO, type ServicoDTO } from '../dtos.js'

export interface EntradaAtualizarServico {
  id: string
  nome?: string
  descricao?: string | null
  preco?: number
}

/** Atualiza os dados cadastrais de um serviço existente. */
export class AtualizarServico implements CasoDeUso<EntradaAtualizarServico, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(entrada: EntradaAtualizarServico): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(entrada.id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', entrada.id)
    }
    servico.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: entrada.preco !== undefined ? Dinheiro.deReais(entrada.preco) : undefined,
    })
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}
