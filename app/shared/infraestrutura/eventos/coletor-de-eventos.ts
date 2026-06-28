import { AsyncLocalStorage } from 'node:async_hooks'
import type { EventoDeDominio } from '#shared/dominio/evento-de-dominio'
import type { RaizAgregado } from '#shared/dominio/raiz-agregado'
import { barramentoDeEventos } from './barramento-de-eventos.js'

/**
 * Buffer de eventos do fluxo assíncrono atual. Quando há um buffer ativo (dentro
 * de uma Unidade de Trabalho), os eventos são acumulados para publicação somente
 * **após o commit**; fora dele, são publicados imediatamente.
 */
const escopo = new AsyncLocalStorage<EventoDeDominio[]>()

/**
 * Extrai os eventos acumulados no agregado e os encaminha para publicação:
 * acumula no buffer da transação ativa, ou publica na hora se não houver uma.
 *
 * Deve ser chamado pelos casos de uso logo após `repositorio.salvar(agregado)`.
 */
export async function coletarEventosDe(agregado: RaizAgregado): Promise<void> {
  const eventos = agregado.extrairEventos()
  if (eventos.length === 0) return

  const buffer = escopo.getStore()
  if (buffer) {
    buffer.push(...eventos)
  } else {
    await barramentoDeEventos.publicar(eventos)
  }
}

/**
 * Executa `operacao` acumulando os eventos coletados durante ela e os publica
 * apenas depois que a operação conclui com sucesso (após o commit). Usado pela
 * Unidade de Trabalho para garantir que nenhum evento vaze antes da persistência.
 */
export async function publicarAposCommit<T>(operacao: () => Promise<T>): Promise<T> {
  const buffer: EventoDeDominio[] = []
  const resultado = await escopo.run(buffer, operacao)
  if (buffer.length > 0) {
    await barramentoDeEventos.publicar(buffer)
  }
  return resultado
}
