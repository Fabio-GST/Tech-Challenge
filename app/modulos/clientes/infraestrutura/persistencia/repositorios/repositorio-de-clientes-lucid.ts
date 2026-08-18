import { opcoesDeCliente } from '#shared/frameworks-drivers/contexto-transacional'
import type { RepositorioDeClientes } from '../../../dominio/repositorios/repositorio-de-clientes.js'
import type { Cliente } from '../../../dominio/entidades/cliente.js'
import { Documento } from '../../../dominio/objetos-de-valor/documento.js'
import ClienteModel from '../models/cliente_model.js'
import { MapeadorDeCliente } from '../mapeadores/mapeador-de-cliente.js'

export class RepositorioDeClientesLucid implements RepositorioDeClientes {
  async salvar(cliente: Cliente): Promise<void> {
    const dados = MapeadorDeCliente.paraPersistencia(cliente)
    await ClienteModel.updateOrCreate({ id: dados.id }, dados, opcoesDeCliente())
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const model = await ClienteModel.find(id, opcoesDeCliente())
    return model ? MapeadorDeCliente.paraDominio(model) : null
  }

  async buscarPorDocumento(documento: Documento): Promise<Cliente | null> {
    const model = await ClienteModel.findBy('documento', documento.valor, opcoesDeCliente())
    return model ? MapeadorDeCliente.paraDominio(model) : null
  }

  async existeComDocumento(documento: Documento): Promise<boolean> {
    const model = await ClienteModel.findBy('documento', documento.valor, opcoesDeCliente())
    return model !== null
  }

  async listar(): Promise<Cliente[]> {
    const models = await ClienteModel.query(opcoesDeCliente()).orderBy('nome', 'asc')
    return models.map(MapeadorDeCliente.paraDominio)
  }

  async remover(id: string): Promise<void> {
    const model = await ClienteModel.find(id, opcoesDeCliente())
    if (model) await model.delete()
  }
}
