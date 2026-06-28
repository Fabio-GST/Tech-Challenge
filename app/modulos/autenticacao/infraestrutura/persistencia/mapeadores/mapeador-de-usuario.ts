import { Usuario } from '../../../dominio/entidades/usuario.js'
import { Email } from '../../../dominio/objetos-de-valor/email.js'
import type UsuarioModel from '../models/usuario_model.js'

/** Converte entre o agregado de domínio `Usuario` e o model Lucid. */
export const MapeadorDeUsuario = {
  paraDominio(model: UsuarioModel): Usuario {
    return Usuario.reconstituir({
      id: model.id,
      nome: model.nome,
      email: Email.criar(model.email),
      senhaHash: model.senhaHash,
    })
  },

  paraPersistencia(usuario: Usuario): {
    id: string
    nome: string
    email: string
    senhaHash: string
  } {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email.valor,
      senhaHash: usuario.senhaHash,
    }
  },
}
