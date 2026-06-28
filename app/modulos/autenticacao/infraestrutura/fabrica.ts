import { servicoDeHash } from '#shared/infraestrutura/hash/servico-de-hash-adonis'
import { servicoJwt } from '#shared/infraestrutura/jwt/servico-jwt'
import { RepositorioDeUsuariosLucid } from './persistencia/repositorios/repositorio-de-usuarios-lucid.js'
import { RegistrarAdministrador } from '../aplicacao/casos-de-uso/registrar-administrador.js'
import { Autenticar } from '../aplicacao/casos-de-uso/autenticar.js'

/**
 * Composition root do módulo de Autenticação: conecta as implementações de
 * infraestrutura (repositório Lucid, hash, JWT) aos casos de uso.
 */
const repositorio = new RepositorioDeUsuariosLucid()

export const fabricaAutenticacao = {
  registrarAdministrador: () => new RegistrarAdministrador(repositorio, servicoDeHash),
  autenticar: () => new Autenticar(repositorio, servicoDeHash, servicoJwt),
}
