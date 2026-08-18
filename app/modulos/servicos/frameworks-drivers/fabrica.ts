import { RepositorioDeServicosLucid } from './persistencia/repositorios/repositorio-de-servicos-lucid.js'
import { CriarServico } from '../aplicacao/casos-de-uso/criar-servico.js'
import { AtualizarServico } from '../aplicacao/casos-de-uso/atualizar-servico.js'
import { InativarServico } from '../aplicacao/casos-de-uso/inativar-servico.js'
import { ReativarServico } from '../aplicacao/casos-de-uso/reativar-servico.js'
import { DefinirTempoEstimado } from '../aplicacao/casos-de-uso/definir-tempo-estimado.js'
import { ObterServico } from '../aplicacao/casos-de-uso/obter-servico.js'
import { ListarServicos } from '../aplicacao/casos-de-uso/listar-servicos.js'
import { RemoverServico } from '../aplicacao/casos-de-uso/remover-servico.js'

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
