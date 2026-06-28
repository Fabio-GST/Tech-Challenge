import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import type { RepositorioDeOrdensServico } from '../../dominio/repositorios/repositorio-de-ordens-servico.js'
import { paraDTO, paraAndamentoDTO, type OrdemServicoDTO, type AndamentoDTO } from '../dtos.js'

/** Detalha uma OS (uso administrativo). */
export class DetalharOrdem implements CasoDeUso<string, OrdemServicoDTO> {
  constructor(private readonly ordens: RepositorioDeOrdensServico) {}

  async executar(id: string): Promise<OrdemServicoDTO> {
    const ordem = await this.ordens.buscarPorId(id)
    if (!ordem) {
      throw new RecursoNaoEncontrado('Ordem de Serviço', id)
    }
    return paraDTO(ordem)
  }
}

/** Lista todas as OS (uso administrativo). */
export class ListarOrdens implements CasoDeUso<void, OrdemServicoDTO[]> {
  constructor(private readonly ordens: RepositorioDeOrdensServico) {}

  async executar(): Promise<OrdemServicoDTO[]> {
    const ordens = await this.ordens.listar()
    return ordens.map(paraDTO)
  }
}

/** Consulta pública (pelo cliente) do andamento de uma OS. */
export class ConsultarAndamento implements CasoDeUso<string, AndamentoDTO> {
  constructor(private readonly ordens: RepositorioDeOrdensServico) {}

  async executar(id: string): Promise<AndamentoDTO> {
    const ordem = await this.ordens.buscarPorId(id)
    if (!ordem) {
      throw new RecursoNaoEncontrado('Ordem de Serviço', id)
    }
    return paraAndamentoDTO(ordem)
  }
}

export interface TempoMedioDTO {
  tempoMedioMinutos: number | null
  ordensConsideradas: number
}

/** Calcula o tempo médio de execução (EM_EXECUCAO → FINALIZADA) das OS. */
export class CalcularTempoMedioExecucao implements CasoDeUso<void, TempoMedioDTO> {
  constructor(private readonly ordens: RepositorioDeOrdensServico) {}

  async executar(): Promise<TempoMedioDTO> {
    const ordens = await this.ordens.listar()
    const duracoes = ordens
      .map((ordem) => ordem.duracaoExecucaoMinutos())
      .filter((minutos): minutos is number => minutos !== null)

    if (duracoes.length === 0) {
      return { tempoMedioMinutos: null, ordensConsideradas: 0 }
    }

    const media = duracoes.reduce((soma, minutos) => soma + minutos, 0) / duracoes.length
    return {
      tempoMedioMinutos: Math.round(media * 100) / 100,
      ordensConsideradas: duracoes.length,
    }
  }
}
