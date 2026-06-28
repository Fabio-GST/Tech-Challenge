import { ObjetoDeValor } from '#shared/dominio/objeto-de-valor'
import { ErroDeValidacao, RegraDeNegocioViolada } from '#shared/dominio/erros'

/** Estados possíveis de uma Ordem de Serviço (Linguagem Ubíqua do negócio). */
export enum StatusOS {
  RECEBIDA = 'RECEBIDA',
  EM_DIAGNOSTICO = 'EM_DIAGNOSTICO',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  FINALIZADA = 'FINALIZADA',
  ENTREGUE = 'ENTREGUE',
  RECUSADA = 'RECUSADA',
}

/**
 * Transições válidas entre estados. A partir de AGUARDANDO_APROVACAO há três
 * ramificações: aprovação (→ EM_EXECUCAO), recusa (→ RECUSADA, terminal) e
 * renegociação (→ EM_DIAGNOSTICO, que reabre a edição de itens/orçamento).
 */
const TRANSICOES: Record<StatusOS, StatusOS[]> = {
  [StatusOS.RECEBIDA]: [StatusOS.EM_DIAGNOSTICO],
  [StatusOS.EM_DIAGNOSTICO]: [StatusOS.AGUARDANDO_APROVACAO],
  [StatusOS.AGUARDANDO_APROVACAO]: [
    StatusOS.EM_EXECUCAO,
    StatusOS.RECUSADA,
    StatusOS.EM_DIAGNOSTICO,
  ],
  [StatusOS.EM_EXECUCAO]: [StatusOS.FINALIZADA],
  [StatusOS.FINALIZADA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [],
  [StatusOS.RECUSADA]: [],
}

interface PropsStatus {
  valor: StatusOS
}

/**
 * Status da Ordem de Serviço como Objeto de Valor, encapsulando a máquina de
 * estados: apenas transições previstas são permitidas.
 */
export class StatusOrdemServico extends ObjetoDeValor<PropsStatus> {
  private constructor(props: PropsStatus) {
    super(props)
  }

  static criar(valor: StatusOS): StatusOrdemServico {
    if (!Object.values(StatusOS).includes(valor)) {
      throw new ErroDeValidacao(`Status de OS inválido: ${valor}`)
    }
    return new StatusOrdemServico({ valor })
  }

  static inicial(): StatusOrdemServico {
    return new StatusOrdemServico({ valor: StatusOS.RECEBIDA })
  }

  get valor(): StatusOS {
    return this.props.valor
  }

  podeTransitarPara(novo: StatusOS): boolean {
    return TRANSICOES[this.props.valor].includes(novo)
  }

  /** Retorna o novo status ou lança caso a transição não seja permitida. */
  transitarPara(novo: StatusOS): StatusOrdemServico {
    if (!this.podeTransitarPara(novo)) {
      throw new RegraDeNegocioViolada(
        `Transição de status inválida: ${this.props.valor} → ${novo}.`
      )
    }
    return StatusOrdemServico.criar(novo)
  }
}
