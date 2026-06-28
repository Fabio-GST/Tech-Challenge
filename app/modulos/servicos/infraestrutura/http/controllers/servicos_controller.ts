import type { HttpContext } from '@adonisjs/core/http'
import { fabricaServicos } from '../../fabrica.js'
import {
  criarServicoValidator,
  atualizarServicoValidator,
  definirTempoEstimadoValidator,
} from '../validadores/servico_validadores.js'

export default class ServicosController {
  /**
   * @index
   * @tag Serviços
   * @summary Lista os serviços oferecidos pela oficina
   * @responseBody 200 - [{"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":true,"tempoEstimadoMinutos":30}] - Lista de serviços
   */
  async index() {
    return fabricaServicos.listar().executar()
  }

  /**
   * @show
   * @tag Serviços
   * @summary Detalha um serviço pelo identificador
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @responseBody 200 - {"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":true,"tempoEstimadoMinutos":30} - Serviço encontrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   */
  async show({ params }: HttpContext) {
    return fabricaServicos.obter().executar(params.id)
  }

  /**
   * @store
   * @tag Serviços
   * @summary Cadastra um novo serviço
   * @requestBody {"nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"tempoEstimadoMinutos":30}
   * @responseBody 201 - {"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":true,"tempoEstimadoMinutos":30} - Serviço cadastrado
   * @responseBody 422 - {"errors":[{"message":"O campo nome é obrigatório"}]} - Dados inválidos
   */
  async store({ request, response }: HttpContext) {
    const dados = await request.validateUsing(criarServicoValidator)
    const servico = await fabricaServicos.criar().executar(dados)
    return response.created(servico)
  }

  /**
   * @update
   * @tag Serviços
   * @summary Atualiza nome, descrição e preço do serviço
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @requestBody {"nome":"Troca de óleo sintético","descricao":"5W30","preco":150}
   * @responseBody 200 - {"id":"uuid","nome":"Troca de óleo sintético","descricao":"5W30","preco":150,"ativo":true,"tempoEstimadoMinutos":30} - Serviço atualizado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   * @responseBody 422 - {"erro":{"codigo":"REGRA_DE_NEGOCIO_VIOLADA","mensagem":"Serviço inativo não pode ser alterado."}} - Serviço inativo
   */
  async update({ params, request }: HttpContext) {
    const dados = await request.validateUsing(atualizarServicoValidator)
    return fabricaServicos.atualizar().executar({ id: params.id, ...dados })
  }

  /**
   * @inativar
   * @tag Serviços
   * @summary Inativa o serviço (bloqueia inclusão em novas OS)
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @responseBody 200 - {"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":false,"tempoEstimadoMinutos":30} - Serviço inativado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   */
  async inativar({ params }: HttpContext) {
    return fabricaServicos.inativar().executar(params.id)
  }

  /**
   * @reativar
   * @tag Serviços
   * @summary Reativa um serviço previamente inativado
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @responseBody 200 - {"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":true,"tempoEstimadoMinutos":30} - Serviço reativado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   */
  async reativar({ params }: HttpContext) {
    return fabricaServicos.reativar().executar(params.id)
  }

  /**
   * @definirTempoEstimado
   * @tag Serviços
   * @summary Define o tempo estimado de execução (em minutos)
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @requestBody {"tempoEstimadoMinutos":45}
   * @responseBody 200 - {"id":"uuid","nome":"Troca de óleo","descricao":"Inclui filtro","preco":120,"ativo":true,"tempoEstimadoMinutos":45} - Tempo estimado definido
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   */
  async definirTempoEstimado({ params, request }: HttpContext) {
    const dados = await request.validateUsing(definirTempoEstimadoValidator)
    return fabricaServicos.definirTempoEstimado().executar({ id: params.id, ...dados })
  }

  /**
   * @destroy
   * @tag Serviços
   * @summary Remove um serviço
   * @paramPath id - Identificador (UUID) do serviço - @type(string)
   * @responseBody 204 - Serviço removido
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Serviço não encontrado."}} - Serviço inexistente
   */
  async destroy({ params, response }: HttpContext) {
    await fabricaServicos.remover().executar(params.id)
    return response.noContent()
  }
}
