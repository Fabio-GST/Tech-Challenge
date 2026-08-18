import { servicoDeHash } from '#shared/frameworks-drivers/hash/servico-de-hash-adonis'
import { servicoJwt } from '#shared/frameworks-drivers/jwt/servico-jwt'
import { RepositorioDeUsuariosLucid } from '../interface-adapters/gateways/repositorio-de-usuarios-lucid.js'
import { RegistrarAdministrador } from '../use-cases/registrar-administrador.js'
import { Autenticar } from '../use-cases/autenticar.js'

/**
 * Composition root do módulo de Autenticação: conecta as implementações de
 * infraestrutura (repositório Lucid, hash, JWT) aos casos de uso.
 */
const repositorio = new RepositorioDeUsuariosLucid()

export const fabricaAutenticacao = {
  registrarAdministrador: () => new RegistrarAdministrador(repositorio, servicoDeHash),
  autenticar: () => new Autenticar(repositorio, servicoDeHash, servicoJwt),
}
