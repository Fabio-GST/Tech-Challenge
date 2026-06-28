/**
 * Porta de notificação. Abstrai o envio de avisos a clientes e ao almoxarife,
 * acionado por Políticas (ex.: "avisar cliente" ao finalizar a OS, alertar o
 * almoxarife quando o estoque atinge o mínimo). A implementação concreta vive na
 * infraestrutura (stub de log neste MVP; e-mail/SMS/push no futuro).
 */
export interface ServicoDeNotificacao {
  notificarCliente(mensagem: string, contexto?: Record<string, unknown>): Promise<void>
  notificarAlmoxarife(mensagem: string, contexto?: Record<string, unknown>): Promise<void>
}
