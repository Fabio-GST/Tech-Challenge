import type { ApplicationService } from '@adonisjs/core/types'
import { registrarClientes } from '#modulos/clientes/frameworks-drivers/fabrica'

/**
 * Provider raiz dos módulos de negócio: pluga as composition roots de cada
 * bounded context no ciclo de vida do AdonisJS. Cada módulo expõe uma função
 * `registrar<Modulo>` em `frameworks-drivers/fabrica.ts`.
 */
export default class ProvedorDeModulos {
  constructor(protected app: ApplicationService) {}

  register() {
    registrarClientes(this.app)
  }
}
