import type { EventoDeDominio } from '#shared/dominio/evento-de-dominio'

/** Disparado quando o veículo é entregue ao cliente (OS concluída). */
export class VeiculoEntregue implements EventoDeDominio {
  readonly nome = 'ordem-servico.veiculo-entregue'
  readonly ocorridoEm = new Date()

  constructor(readonly ordemServicoId: string) {}
}
