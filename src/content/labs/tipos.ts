import type { ScenarioInput } from '../../scenario/schema'

export const r = String.raw

/** Liga a varredura dos parâmetros; mexer em um deles passa para o manual. */
export const MOVIMENTO = { id: 'auto', rotulo: 'Movimento', valor: 1, opcoes: [{ valor: 1, rotulo: 'Automático' }, { valor: 0, rotulo: 'Manual' }] }

/** Laboratório antes de ganhar o número, que sai da ordem da ementa em `index.ts`. */
export interface LabNovo {
  grupo: string
  cenario: ScenarioInput
}

export interface LabEntry extends LabNovo {
  numero: string
}
