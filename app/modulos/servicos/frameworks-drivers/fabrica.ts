import { RepositorioDeServicosLucid } from '../interface-adapters/gateways/repositorio-de-servicos-lucid.js'
import { CriarServico } from '../use-cases/criar-servico.js'
import { AtualizarServico } from '../use-cases/atualizar-servico.js'
import { InativarServico } from '../use-cases/inativar-servico.js'
import { ReativarServico } from '../use-cases/reativar-servico.js'
import { DefinirTempoEstimado } from '../use-cases/definir-tempo-estimado.js'
import { ObterServico } from '../use-cases/obter-servico.js'
import { ListarServicos } from '../use-cases/listar-servicos.js'
import { RemoverServico } from '../use-cases/remover-servico.js'

const repositorio = new RepositorioDeServicosLucid()

export const fabricaServicos = {
  repositorio: () => repositorio,
  criar: () => new CriarServico(repositorio),
  atualizar: () => new AtualizarServico(repositorio),
  inativar: () => new InativarServico(repositorio),
  reativar: () => new ReativarServico(repositorio),
  definirTempoEstimado: () => new DefinirTempoEstimado(repositorio),
  obter: () => new ObterServico(repositorio),
  listar: () => new ListarServicos(repositorio),
  remover: () => new RemoverServico(repositorio),
}
