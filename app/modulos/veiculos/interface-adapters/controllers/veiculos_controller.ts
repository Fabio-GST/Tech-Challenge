import type { HttpContext } from '@adonisjs/core/http'
import { fabricaVeiculos } from '../../frameworks-drivers/fabrica.js'
import {
  criarVeiculoValidator,
  atualizarVeiculoValidator,
  vincularClienteValidator,
} from '../../frameworks-drivers/validadores/veiculo_validadores.js'

export default class VeiculosController {
  /**
   * @index
   * @tag Veículos
   * @summary Lista os veículos (opcionalmente filtrando por cliente)
   * @paramQuery clienteId - Filtra os veículos de um cliente específico (UUID) - @type(string)
   * @responseBody 200 - [{"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020}] - Lista de veículos
   */
  async index({ request }: HttpContext) {
    const clienteId = request.qs().clienteId as string | undefined
    return fabricaVeiculos.listar().executar({ clienteId })
  }

  /**
   * @show
   * @tag Veículos
   * @summary Detalha um veículo pelo identificador
   * @paramPath id - Identificador (UUID) do veículo - @type(string)
   * @responseBody 200 - {"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020} - Veículo encontrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Veículo não encontrado."}} - Veículo inexistente
   */
  async show({ params }: HttpContext) {
    return fabricaVeiculos.obter().executar(params.id)
  }

  /**
   * @porPlaca
   * @tag Veículos
   * @summary Busca um veículo pela placa
   * @paramPath placa - Placa no formato antigo (AAA9999) ou Mercosul (AAA9A99) - @type(string)
   * @responseBody 200 - {"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020} - Veículo encontrado
   * @responseBody 404 - {"mensagem":"Veículo não encontrado para a placa informada."} - Placa não cadastrada
   */
  async porPlaca({ params, response }: HttpContext) {
    const veiculo = await fabricaVeiculos.buscarPorPlaca().executar(params.placa)
    if (!veiculo) {
      return response.notFound({ mensagem: 'Veículo não encontrado para a placa informada.' })
    }
    return veiculo
  }

  /**
   * @vincularCliente
   * @tag Veículos
   * @summary Vincula (ou transfere) o veículo a um cliente
   * @paramPath id - Identificador (UUID) do veículo - @type(string)
   * @requestBody {"clienteId":"uuid"}
   * @responseBody 200 - {"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020} - Veículo vinculado ao novo cliente
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Veículo ou cliente não encontrado."}} - Veículo ou cliente inexistente
   */
  async vincularCliente({ params, request }: HttpContext) {
    const dados = await request.validateUsing(vincularClienteValidator)
    return fabricaVeiculos.vincularCliente().executar({ id: params.id, ...dados })
  }

  /**
   * @store
   * @tag Veículos
   * @summary Cadastra um novo veículo para um cliente
   * @requestBody {"clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020}
   * @responseBody 201 - {"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno","ano":2020} - Veículo cadastrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Cliente não encontrado."}} - Cliente do veículo inexistente
   * @responseBody 409 - {"erro":{"codigo":"CONFLITO_DE_RECURSO","mensagem":"Já existe um veículo com a placa informada."}} - Placa já cadastrada
   * @responseBody 422 - {"errors":[{"message":"O campo placa é obrigatório"}]} - Dados inválidos
   */
  async store({ request, response }: HttpContext) {
    const dados = await request.validateUsing(criarVeiculoValidator)
    const veiculo = await fabricaVeiculos.criar().executar(dados)
    return response.created(veiculo)
  }

  /**
   * @update
   * @tag Veículos
   * @summary Atualiza marca, modelo e ano do veículo
   * @paramPath id - Identificador (UUID) do veículo - @type(string)
   * @requestBody {"marca":"Fiat","modelo":"Uno Way","ano":2021}
   * @responseBody 200 - {"id":"uuid","clienteId":"uuid","placa":"ABC1D23","marca":"Fiat","modelo":"Uno Way","ano":2021} - Veículo atualizado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Veículo não encontrado."}} - Veículo inexistente
   */
  async update({ params, request }: HttpContext) {
    const dados = await request.validateUsing(atualizarVeiculoValidator)
    return fabricaVeiculos.atualizar().executar({ id: params.id, ...dados })
  }

  /**
   * @destroy
   * @tag Veículos
   * @summary Remove um veículo
   * @paramPath id - Identificador (UUID) do veículo - @type(string)
   * @responseBody 204 - Veículo removido
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Veículo não encontrado."}} - Veículo inexistente
   */
  async destroy({ params, response }: HttpContext) {
    await fabricaVeiculos.remover().executar(params.id)
    return response.noContent()
  }
}
