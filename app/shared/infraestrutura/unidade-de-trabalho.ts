import db from '@adonisjs/lucid/services/db'
import { contextoTransacional } from './contexto-transacional.js'
import { publicarAposCommit } from './eventos/coletor-de-eventos.js'

/**
 * Unidade de Trabalho (Unit of Work).
 *
 * Executa uma operação dentro de uma única transação de banco. Todos os
 * repositórios chamados dentro do callback participam automaticamente da mesma
 * transação (via {@link contextoTransacional}), garantindo atomicidade — por
 * exemplo, dar baixa no estoque e persistir a Ordem de Serviço de uma só vez.
 *
 * Os Eventos de Domínio coletados durante a operação (via `coletarEventosDe`)
 * são publicados somente **após o commit**, evitando reações a um estado que
 * ainda poderia sofrer rollback.
 */
export class UnidadeDeTrabalho {
  async executar<T>(operacao: () => Promise<T>): Promise<T> {
    return publicarAposCommit(() =>
      db.transaction((trx) => contextoTransacional.run(trx, operacao))
    )
  }
}
