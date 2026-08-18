import { opcoesDeCliente } from '#shared/frameworks-drivers/contexto-transacional'
import type { RepositorioDeUsuarios } from '../../../dominio/repositorios/repositorio-de-usuarios.js'
import type { Usuario } from '../../../dominio/entidades/usuario.js'
import { Email } from '../../../dominio/objetos-de-valor/email.js'
import UsuarioModel from '../models/usuario_model.js'
import { MapeadorDeUsuario } from '../mapeadores/mapeador-de-usuario.js'

export class RepositorioDeUsuariosLucid implements RepositorioDeUsuarios {
  async salvar(usuario: Usuario): Promise<void> {
    const dados = MapeadorDeUsuario.paraPersistencia(usuario)
    await UsuarioModel.updateOrCreate({ id: dados.id }, dados, opcoesDeCliente())
  }

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const model = await UsuarioModel.findBy('email', email.valor, opcoesDeCliente())
    return model ? MapeadorDeUsuario.paraDominio(model) : null
  }

  async existeComEmail(email: Email): Promise<boolean> {
    const model = await UsuarioModel.findBy('email', email.valor, opcoesDeCliente())
    return model !== null
  }
}
