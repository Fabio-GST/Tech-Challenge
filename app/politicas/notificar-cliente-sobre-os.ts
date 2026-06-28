import type { EventoDeDominio } from '#shared/dominio/evento-de-dominio'
import type { ManipuladorDeEvento } from '#shared/aplicacao/manipulador-de-evento'
import type { ServicoDeNotificacao } from '#shared/aplicacao/servico-de-notificacao'

interface EventoComOrdem extends EventoDeDominio {
  ordemServicoId: string
}

/**
 * Política genérica de "avisar o cliente" sobre marcos da OS (aprovação,
 * entrega etc.). Inscreve-se em um evento e dispara uma notificação.
 */
export class NotificarClienteSobreOS implements ManipuladorDeEvento<EventoComOrdem> {
  constructor(
    readonly evento: string,
    private readonly mensagem: string,
    private readonly notificacao: ServicoDeNotificacao
  ) {}

  async manipular(evento: EventoComOrdem): Promise<void> {
    await this.notificacao.notificarCliente(this.mensagem, {
      ordemServicoId: evento.ordemServicoId,
    })
  }
}
