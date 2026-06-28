import { opcoesDeCliente } from '#shared/infraestrutura/contexto-transacional'
import type { RepositorioDeVeiculos } from '../../../dominio/repositorios/repositorio-de-veiculos.js'
import type { Veiculo } from '../../../dominio/entidades/veiculo.js'
import { Placa } from '../../../dominio/objetos-de-valor/placa.js'
import VeiculoModel from '../models/veiculo_model.js'
import { MapeadorDeVeiculo } from '../mapeadores/mapeador-de-veiculo.js'

export class RepositorioDeVeiculosLucid implements RepositorioDeVeiculos {
  async salvar(veiculo: Veiculo): Promise<void> {
    const dados = MapeadorDeVeiculo.paraPersistencia(veiculo)
    await VeiculoModel.updateOrCreate({ id: dados.id }, dados, opcoesDeCliente())
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    const model = await VeiculoModel.find(id, opcoesDeCliente())
    return model ? MapeadorDeVeiculo.paraDominio(model) : null
  }

  async buscarPorPlaca(placa: Placa): Promise<Veiculo | null> {
    const model = await VeiculoModel.findBy('placa', placa.valor, opcoesDeCliente())
    return model ? MapeadorDeVeiculo.paraDominio(model) : null
  }

  async existeComPlaca(placa: Placa): Promise<boolean> {
    const model = await VeiculoModel.findBy('placa', placa.valor, opcoesDeCliente())
    return model !== null
  }

  async listar(): Promise<Veiculo[]> {
    const models = await VeiculoModel.query(opcoesDeCliente()).orderBy('marca', 'asc')
    return models.map(MapeadorDeVeiculo.paraDominio)
  }

  async listarPorCliente(clienteId: string): Promise<Veiculo[]> {
    const models = await VeiculoModel.query(opcoesDeCliente()).where('cliente_id', clienteId)
    return models.map(MapeadorDeVeiculo.paraDominio)
  }

  async remover(id: string): Promise<void> {
    const model = await VeiculoModel.find(id, opcoesDeCliente())
    if (model) await model.delete()
  }
}
