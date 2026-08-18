import type { HttpContext } from '@adonisjs/core/http'
import { fabricaClientes } from '../../frameworks-drivers/fabrica.js'
import {
  criarClienteValidator,
  atualizarClienteValidator,
} from '../../frameworks-drivers/validadores/cliente_validadores.js'

export default class ClientesController {
  /**
   * @index
   * @tag Clientes
   * @summary Lista todos os clientes
   * @responseBody 200 - [{"id":"uuid","nome":"Maria Silva","documento":"11144477735","tipoDocumento":"CPF","telefone":"11999998888","email":"maria@exemplo.com"}] - Lista de clientes
   */
  async index() {
    return fabricaClientes.listar().executar()
  }

  /**
   * @show
   * @tag Clientes
   * @summary Detalha um cliente pelo identificador
   * @paramPath id - Identificador (UUID) do cliente - @type(string)
   * @responseBody 200 - {"id":"uuid","nome":"Maria Silva","documento":"11144477735","tipoDocumento":"CPF"} - Cliente encontrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Cliente não encontrado."}} - Cliente inexistente
   */
  async show({ params }: HttpContext) {
    return fabricaClientes.obter().executar(params.id)
  }

  /**
   * @porDocumento
   * @tag Clientes
   * @summary Busca um cliente pelo CPF/CNPJ
   * @paramPath documento - CPF (11 dígitos) ou CNPJ (14 dígitos), apenas números - @type(string)
   * @responseBody 200 - {"id":"uuid","nome":"Maria Silva","documento":"11144477735","tipoDocumento":"CPF"} - Cliente encontrado
   * @responseBody 404 - {"mensagem":"Cliente não encontrado para o documento informado."} - Documento não cadastrado
   */
  async porDocumento({ params, response }: HttpContext) {
    const cliente = await fabricaClientes.buscarPorDocumento().executar(params.documento)
    if (!cliente) {
      return response.notFound({ mensagem: 'Cliente não encontrado para o documento informado.' })
    }
    return cliente
  }

  /**
   * @store
   * @tag Clientes
   * @summary Cadastra um novo cliente
   * @requestBody {"nome":"Maria Silva","documento":"11144477735","telefone":"11999998888","email":"maria@exemplo.com"}
   * @responseBody 201 - {"id":"uuid","nome":"Maria Silva","documento":"11144477735","tipoDocumento":"CPF","telefone":"11999998888","email":"maria@exemplo.com"} - Cliente cadastrado
   * @responseBody 409 - {"erro":{"codigo":"CONFLITO_DE_RECURSO","mensagem":"Já existe um cliente com o documento informado."}} - Documento já cadastrado
   * @responseBody 422 - {"errors":[{"message":"O campo documento é obrigatório"}]} - Dados inválidos
   */
  async store({ request, response }: HttpContext) {
    const dados = await request.validateUsing(criarClienteValidator)
    const cliente = await fabricaClientes.criar().executar(dados)
    return response.created(cliente)
  }

  /**
   * @update
   * @tag Clientes
   * @summary Atualiza os dados cadastrais de um cliente
   * @paramPath id - Identificador (UUID) do cliente - @type(string)
   * @requestBody {"nome":"Maria S. Silva","telefone":"11888887777","email":"maria@novo.com"}
   * @responseBody 200 - {"id":"uuid","nome":"Maria S. Silva","documento":"11144477735","tipoDocumento":"CPF","telefone":"11888887777","email":"maria@novo.com"} - Cliente atualizado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Cliente não encontrado."}} - Cliente inexistente
   */
  async update({ params, request }: HttpContext) {
    const dados = await request.validateUsing(atualizarClienteValidator)
    return fabricaClientes.atualizar().executar({ id: params.id, ...dados })
  }

  /**
   * @destroy
   * @tag Clientes
   * @summary Remove um cliente
   * @paramPath id - Identificador (UUID) do cliente - @type(string)
   * @responseBody 204 - Cliente removido
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Cliente não encontrado."}} - Cliente inexistente
   */
  async destroy({ params, response }: HttpContext) {
    await fabricaClientes.remover().executar(params.id)
    return response.noContent()
  }
}
