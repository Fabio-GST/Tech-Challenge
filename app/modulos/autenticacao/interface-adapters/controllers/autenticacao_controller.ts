import type { HttpContext } from '@adonisjs/core/http'
import { fabricaAutenticacao } from '../../fabrica.js'
import {
  registrarAdministradorValidator,
  autenticarValidator,
} from '../validadores/autenticacao_validadores.js'

export default class AutenticacaoController {
  /**
   * @register
   * @tag Autenticação
   * @summary Cadastra um novo Usuário administrativo
   * @description Cria um **Usuario** operador do sistema. Apenas administradores autenticados podem registrar novos usuários.
   * @requestBody {"nome":"João","email":"joao@oficina.com","senha":"senhaSegura1"}
   * @responseBody 201 - {"id":"uuid","nome":"João","email":"joao@oficina.com"} - Usuário cadastrado
   * @responseBody 422 - {"errors":[{"message":"O campo email é obrigatório"}]} - Dados inválidos
   */
  async register({ request, response }: HttpContext) {
    const dados = await request.validateUsing(registrarAdministradorValidator)
    const saida = await fabricaAutenticacao.registrarAdministrador().executar(dados)
    return response.created(saida)
  }

  /**
   * @login
   * @tag Autenticação
   * @summary Autentica um Administrador e retorna um JWT
   * @description Valida e-mail e senha do **Usuario** e emite token Bearer para as APIs administrativas.
   * @requestBody {"email":"joao@oficina.com","senha":"senhaSegura1"}
   * @responseBody 200 - {"token":"eyJhbG...","usuario":{"id":"uuid","nome":"João","email":"joao@oficina.com"}} - Autenticação bem-sucedida
   * @responseBody 401 - {"erro":{"codigo":"NAO_AUTENTICADO","mensagem":"Credenciais inválidas."}} - Credenciais inválidas
   * @responseBody 422 - {"errors":[{"message":"O campo senha é obrigatório"}]} - Dados inválidos
   */
  async login({ request }: HttpContext) {
    const dados = await request.validateUsing(autenticarValidator)
    return fabricaAutenticacao.autenticar().executar(dados)
  }

  /**
   * @me
   * @tag Autenticação
   * @summary Retorna o Usuário autenticado
   * @description Consulta os dados do **Usuario** vinculado ao JWT informado no header Authorization.
   * @responseBody 200 - {"id":"uuid","nome":"João","email":"joao@oficina.com"} - Usuário autenticado
   * @responseBody 401 - {"erro":{"codigo":"NAO_AUTENTICADO","mensagem":"Token inválido ou expirado."}} - Token inválido
   */
  async me({ usuarioAutenticado }: HttpContext) {
    return {
      id: usuarioAutenticado!.sub,
      nome: usuarioAutenticado!.nome,
      email: usuarioAutenticado!.email,
    }
  }
}
