import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { OrdemServico } from '../../../dominio/entidades/ordem-servico.js'
import { ItemOrdemServico, type TipoItem } from '../../../dominio/entidades/item-ordem-servico.js'
import {
  StatusOrdemServico,
  StatusOS,
} from '../../../dominio/objetos-de-valor/status-ordem-servico.js'
import { PrioridadeOS } from '../../../dominio/objetos-de-valor/prioridade-os.js'
import type OrdemServicoModel from '../models/ordem_servico_model.js'

export const MapeadorDeOrdemServico = {
  paraDominio(model: OrdemServicoModel): OrdemServico {
    return OrdemServico.reconstituir({
      id: model.id,
      clienteId: model.clienteId,
      veiculoId: model.veiculoId,
      status: StatusOrdemServico.criar(model.status as StatusOS),
      prioridade: (model.prioridade as PrioridadeOS) ?? PrioridadeOS.NORMAL,
      itens: model.itens.map((item) =>
        ItemOrdemServico.reconstituir({
          id: item.id,
          tipo: item.tipo as TipoItem,
          referenciaId: item.referenciaId,
          descricao: item.descricao,
          precoUnitario: Dinheiro.deCentavos(item.precoUnitarioCentavos),
          quantidade: item.quantidade,
        })
      ),
      historico: model.historico.map((registro) => ({
        status: registro.status as StatusOS,
        ocorridoEm: registro.ocorridoEm,
      })),
      criadaEm: model.createdAt,
    })
  },
}
