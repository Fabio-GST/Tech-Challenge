import { Veiculo } from '../../../dominio/entidades/veiculo.js'
import { Placa } from '../../../dominio/objetos-de-valor/placa.js'
import type VeiculoModel from '../models/veiculo_model.js'

export const MapeadorDeVeiculo = {
  paraDominio(model: VeiculoModel): Veiculo {
    return Veiculo.reconstituir({
      id: model.id,
      clienteId: model.clienteId,
      placa: Placa.criar(model.placa),
      marca: model.marca,
      modelo: model.modelo,
      ano: model.ano,
    })
  },

  paraPersistencia(veiculo: Veiculo) {
    return {
      id: veiculo.id,
      clienteId: veiculo.clienteId,
      placa: veiculo.placa.valor,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
    }
  },
}
