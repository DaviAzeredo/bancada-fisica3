import type { ProvaInput } from '../../scenario/schema'
import { p1_2023_1_noturno } from './p1-2023-1-noturno'
import { p1_2024_1_diurno } from './p1-2024-1-diurno'
import { p1_2024_2_diurno } from './p1-2024-2-diurno'
import { p1_2025_1_diurno } from './p1-2025-1-diurno'
import { p1_2025_2_diurno } from './p1-2025-2-diurno'
import { p1_2026_1_diurno } from './p1-2026-1-diurno'
import { p1_2026_2_diurno } from './p1-2026-2-diurno'
import { p2_2022_2_noturno } from './p2-2022-2-noturno'
import { p2_2023_1_noturno } from './p2-2023-1-noturno'
import { p2_2023_2_diurno } from './p2-2023-2-diurno'
import { p2_2024_1_diurno } from './p2-2024-1-diurno'
import { p2_2024_2_diurno } from './p2-2024-2-diurno'
import { p2_2025_1_diurno } from './p2-2025-1-diurno'
import { p2_2025_2_diurno } from './p2-2025-2-diurno'
import { p2_2026_1_diurno } from './p2-2026-1-diurno'
import { p3_2023_2_diurno } from './p3-2023-2-diurno'
import { p3_2023_2_noturno } from './p3-2023-2-noturno'
import { p3_2024_1_diurno } from './p3-2024-1-diurno'
import { p3_2024_1_noturno } from './p3-2024-1-noturno'
import { p3_2024_2_diurno } from './p3-2024-2-diurno'
import { p3_2025_1_diurno } from './p3-2025-1-diurno'
import { p3_2025_2_diurno } from './p3-2025-2-diurno'
import { p3_2026_1_diurno } from './p3-2026-1-diurno'
import { pf_2023_1_noturno } from './pf-2023-1-noturno'
import { sc_2023_1_noturno } from './sc-2023-1-noturno'
import { sc_2023_2_diurno } from './sc-2023-2-diurno'
import { sc_2024_1_diurno } from './sc-2024-1-diurno'

/**
 * Da mais recente para a mais antiga; a primeira aparece aberta na página inicial.
 * Esta lista alimenta os testes e o catálogo: o site não a importa, porque traria
 * todas as provas de uma vez. Ele usa o catálogo e baixa uma prova por rota.
 */
export const PROVAS: ProvaInput[] = [p1_2026_2_diurno, p3_2026_1_diurno, p2_2026_1_diurno, p1_2026_1_diurno, p1_2025_2_diurno, p2_2025_2_diurno, p3_2025_2_diurno, p1_2025_1_diurno, p2_2025_1_diurno, p3_2025_1_diurno, p1_2024_2_diurno, p2_2024_2_diurno, p3_2024_2_diurno, p1_2024_1_diurno, p2_2024_1_diurno, p3_2024_1_diurno, p3_2024_1_noturno, sc_2024_1_diurno, p2_2023_2_diurno, p3_2023_2_diurno, p3_2023_2_noturno, sc_2023_2_diurno, p1_2023_1_noturno, p2_2023_1_noturno, pf_2023_1_noturno, sc_2023_1_noturno, p2_2022_2_noturno]
