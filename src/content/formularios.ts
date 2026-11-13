import type { ProvaInput } from '../scenario/schema'

const r = String.raw

/**
 * Formulários impressos no topo das provas, transcritos sem acrescentar nada.
 * Cada lista usa o da prova que cobre o assunto dela. O 𝓇 (vetor da fonte ao
 * ponto) das provas virou r, como nos outros formulários.
 */
type Formulario = NonNullable<ProvaInput['formulario']>

export const FORMULARIO_P1: Formulario = {
  fonte: 'Formulário da P1 de 2026/2',
  formulas: [
    r`\vec F_{(e)} = q\vec E`,
    r`\vec E = k_0\frac{q}{r^2}\,\hat r = k_0\frac{q}{r^3}\,\vec r \;\left(\text{onde } k_0 \coloneqq \frac{1}{4\pi\varepsilon_0}\right)`,
    r`\vec p = q\vec L`,
    r`\vec\tau = \vec p\times\vec E`,
    r`U = -\vec p\cdot\vec E`,
    r`\oint_S \vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}`,
    r`\vec E = -\vec\nabla V`,
    r`V = k_0\frac{q}{r}`,
    r`U = k_0\frac{qq'}{r}`,
    r`dU = q\,dV`,
    r`(1 + x)^n \simeq 1 + nx,\;\; x, n\in\mathbb R \text{ e } |x| \ll 1`,
  ],
}

const P2_P3 = [
  r`\vec F_{(e)} = q\vec E`,
  r`\vec E = k_0\frac{q}{r^2}\,\hat r \;\left(k_0 \coloneqq \frac{1}{4\pi\varepsilon_0}\right)`,
]

export const FORMULARIO_P2: Formulario = {
  fonte: 'Formulário da P2 de 2026/1',
  formulas: [
    ...P2_P3,
    r`\oint_S \vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}`,
    r`\vec E = -\vec\nabla V`,
    r`V = k_0\frac{q}{r}`,
    r`C = \frac{Q}{V}`,
    r`C = KC_0`,
    r`U = \frac12 QV`,
    r`\vec J = \frac1\rho\vec E`,
    r`I = \int_S \vec J\cdot d\vec A`,
    r`V = RI`,
    r`\oint_S \vec B\cdot d\vec A = 0`,
    r`\vec F_{(m)} = q\vec v\times\vec B`,
    r`d\vec F_{(m)} = I\,d\vec\ell\times\vec B`,
    r`\vec\mu = NI\vec A`,
    r`\vec\tau = \vec\mu\times\vec B`,
  ],
}

export const FORMULARIO_P3: Formulario = {
  fonte: 'Formulário da P3 de 2026/1',
  formulas: [
    ...P2_P3,
    r`\oint_{S \coloneqq \partial\mathcal R} \vec E\cdot d\vec A = \frac{Q_\text{int}[\mathcal R]}{\varepsilon_0}`,
    r`\vec E = -\vec\nabla V`,
    r`V = k_0\frac{q}{r}`,
    r`C = \frac{Q}{V}`,
    r`C = KC_0`,
    r`U = \frac12 QV`,
    r`\vec J = \frac1\rho\vec E`,
    r`I[S] = \int_S \vec J\cdot d\vec A`,
    r`V = RI`,
    r`\oint_S \vec B\cdot d\vec A = 0`,
    r`\vec F_{(m)} = q\vec v\times\vec B`,
    r`d\vec F_{(m)} = I\,d\vec\ell\times\vec B`,
    r`\vec\mu = NI\vec A`,
    r`\vec\tau = \vec\mu\times\vec B`,
    r`\vec B = \frac{\mu_0}{4\pi}\frac{q\vec v\times\hat r}{r^2}`,
    r`d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec\ell\times\hat r}{r^2}`,
    r`\mathcal E_\text{ind}[C \coloneqq \partial S] = -\frac{d\Phi_{\vec B}[S]}{dt}`,
    r`\oint_{C = \partial S} \vec B\cdot d\vec\ell = \mu_0 I_\text{enc}[S] + \mu_0\varepsilon_0\frac{d\Phi_{\vec E}[S]}{dt}`,
  ],
}

/* ── Formulário de cada prova, como sai impresso nela ── */

const prova = (formulas: string[]): Formulario => ({ fonte: 'Formulário desta prova', formulas })

// peças que se repetem de um semestre para outro
const Fe = r`\vec F_{(e)} = q\vec E`
const Fe_ = r`\vec F_e = q\vec E`
const Eonde = r`\vec E = k_0\frac{q}{r^2}\,\hat r \;\left(\text{onde } k_0 \coloneqq \frac{1}{4\pi\varepsilon_0}\right)`
const Ek = r`\vec E = k_0\frac{q}{r^2}\,\hat r \;\left[k_0 = 1/(4\pi\varepsilon_0)\right]`
const Ek2 = r`\vec E = k_0\frac{q}{r^2}\,\hat r \;\left(k_0 = \frac{1}{4\pi\varepsilon_0}\right)`
const GaussInt = r`\oint_S \vec E\cdot d\vec A = \frac{Q_\text{int}}{\varepsilon_0}`
const GaussS = r`\oint_S \vec E\cdot d\vec S = Q_\text{int}^{(S)}/\varepsilon_0`
const GaussEnc = r`\oint_S \vec E\cdot d\vec A = Q_\text{enc}/\varepsilon_0`
const grad = r`\vec E = -\vec\nabla V`
const Vq = r`V = k_0\frac{q}{r}`
const Uqq = r`U = k_0\frac{qq'}{r}`
const Vint = r`V(b) - V(a) = -\int_a^b \vec E\cdot d\vec\ell`
const UqV = r`U = qV`
const CQV = r`C = Q/V`
const Ceps = r`C = \varepsilon_0A/d`
const Ue = r`U_e = \tfrac12 CV^2`
const Iint = r`I = \int_S \vec J\cdot d\vec A`
const Jnqv = r`\vec J = nq\vec v`
const Jnqvd = r`\vec J = nq\vec v_d`
const Jsig = r`\vec J = \sigma\vec E`
const VRI = r`V = RI`
const RrL = r`R = \rho L/A`
const RrL_ = r`R = \rho\frac{L}{A}`
const Fm = r`\vec F_{(m)} = q\vec v\times\vec B`
const dFm = r`d\vec F_{(m)} = I\,d\vec\ell\times\vec B`
const Fm_ = r`\vec F_m = q\vec v\times\vec B`
const dFm_ = r`d\vec F_m = I\,d\vec\ell\times\vec B`
const mu = r`\vec\mu = NI\vec A`
const tau = r`\vec\tau = \vec\mu\times\vec B`
const divB = r`\oint_S \vec B\cdot d\vec A = 0`
const dBbs = r`d\vec B = \frac{\mu_0}{4\pi}\frac{I\,d\vec\ell\times\hat r}{r^2}`
const Bq = r`\vec B = \frac{\mu_0}{4\pi}\frac{q\vec v\times\hat r}{r^2}`
const BbsInt = r`\vec B = \frac{\mu_0I}{4\pi}\int_C\frac{d\vec\ell\times\vec r}{r^3}`
const ampMax = r`\oint_C \vec B\cdot d\vec\ell = \mu_0I_\text{enc} + \mu_0\varepsilon_0\frac{d\Phi_E}{dt}`
const ampMax2 = r`\oint_C \vec B\cdot d\vec\ell = \mu_0\left[I_\text{enc} + \varepsilon_0\frac{d\Phi_E}{dt}\right]`
const far = r`\mathcal E_\text{ind} = -\frac{d\Phi_B}{dt}`
const femMov = r`\mathcal E_\text{ind} = \oint_C (\vec v\times\vec B)\cdot d\vec\ell`

const P1_2024 = prova([Fe_, Ek2, GaussS, grad, Vint, UqV, Uqq])
const P3_2024 = [Fe_, Ek, GaussEnc, grad, Vint, UqV, Vq, Iint, Jsig, Jnqvd, VRI, RrL, CQV, Ceps, Ue, Fm_, dFm_, mu, tau, divB, BbsInt, ampMax2, far]
const P3_2023 = [Fe_, Ek2, GaussEnc, grad, Vq, Vint, Uqq, r`C = \frac{Q}{V}`, Iint, Jnqvd, Jsig, VRI, RrL_, Fm, dFm, mu, tau, divB, BbsInt, ampMax2, far]
const PF_2023 = [Fe, Ek2, GaussInt, grad, Vq, Uqq, CQV, Iint, Jnqv, Jsig, VRI, RrL_, Fm, dFm, mu, tau, divB, dBbs, far, ampMax, r`U = Q^2/2C`]

export const FORMULARIOS_PROVAS: Record<string, Formulario> = {
  'p1-2023-1-noturno': prova([Fe, Eonde, GaussInt, grad, Vq, Uqq]),
  'p1-2024-1-diurno': P1_2024,
  'p1-2024-2-diurno': P1_2024,
  'p1-2025-1-diurno': P1_2024,
  'p1-2025-2-diurno': prova([
    Fe,
    Eonde,
    GaussInt,
    grad,
    Vq,
    Uqq,
    r`\forall\epsilon, n\in\mathbb R,\ |\epsilon| \ll 1 \implies (1 + \epsilon)^n \simeq 1 + n\epsilon + \tfrac12n(n - 1)\epsilon^2`,
  ]),
  'p1-2026-1-diurno': prova([
    Fe,
    Eonde,
    GaussInt,
    grad,
    Vq,
    Uqq,
    r`\sin^2\theta = \frac{1 - \cos(2\theta)}{2}`,
    r`\ln(1 + x) \simeq x - \tfrac12x^2\ \ (|x| \ll 1)`,
  ]),
  'p1-2026-2-diurno': { ...FORMULARIO_P1, fonte: 'Formulário desta prova' },
  'p2-2022-2-noturno': prova([Iint, Jnqv, Jsig, VRI, RrL_, Fm, dFm, divB, dBbs, ampMax, far, femMov]),
  'p2-2023-1-noturno': prova([Iint, Jnqv, r`\vec E = \rho\vec J`, r`C = Q/V`, RrL_, Fm, dFm, mu, tau, divB, dBbs, ampMax, far, femMov]),
  'p2-2024-1-diurno': prova([Fe_, Ek, GaussS, grad, Vint, UqV, Uqq, Iint, Jsig, Jnqvd, VRI, RrL, CQV, Ceps, Ue, Fm_, dFm_, mu, tau, divB]),
  'p2-2024-2-diurno': prova([Fe_, Ek, GaussS, grad, Vint, UqV, Uqq, Iint, Jsig, Jnqvd, VRI, RrL, CQV, Ceps, Ue, Fm_, dFm_, mu, tau, divB]),
  'p2-2025-1-diurno': prova([Fe, Eonde, GaussInt, grad, Vq, Uqq, CQV, Iint, Jnqv, Jsig, VRI, RrL_, Fm, dFm, mu, tau, divB]),
  'p2-2025-2-diurno': prova([
    Fe,
    Eonde,
    GaussInt,
    grad,
    Vq,
    Uqq,
    CQV,
    Iint,
    Jnqv,
    Jsig,
    VRI,
    RrL_,
    Fm,
    dFm,
    mu,
    tau,
    divB,
    r`\forall x, \alpha\in\mathbb R,\ |x| \ll 1 \implies (1 + x)^\alpha \simeq 1 + \alpha x + \tfrac12\alpha(\alpha - 1)x^2`,
    r`\forall x\in\mathbb R,\ |x| \ll 1 \implies \ln(1 + x) \simeq x - \tfrac12x^2`,
  ]),
  'p2-2026-1-diurno': { ...FORMULARIO_P2, fonte: 'Formulário desta prova' },
  'p3-2023-2-diurno': prova(P3_2023),
  'p3-2023-2-noturno': prova([
    Fe,
    r`\vec E = \frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\,\hat r`,
    GaussInt,
    grad,
    r`V = \frac{1}{4\pi\varepsilon_0}\frac{q}{r}`,
    r`U = \frac{1}{4\pi\varepsilon_0}\frac{qq'}{r}`,
    r`V(r_b) - V(r_a) = -\int_{r_a}^{r_b}\vec E\cdot d\vec\ell`,
    r`C = \frac QV`,
    r`U_C = \frac12CV^2`,
    Iint,
    Jnqv,
    Jsig,
    VRI,
    RrL_,
    Fm,
    dFm,
    r`\vec\mu = I\vec A`,
    tau,
    divB,
    dBbs,
    far,
    ampMax,
  ]),
  'p3-2024-1-diurno': prova([...P3_2024, r`\int\frac{dx}{[x^2 + a^2]^{3/2}} = \frac{x}{a^2\sqrt{x^2 + a^2}} + C`]),
  'p3-2024-2-diurno': prova(P3_2024),
  'p3-2025-1-diurno': prova([
    Fe,
    r`\vec E = k_0\frac{q}{r^2}\,\hat r \;\left(k_0 \coloneqq \frac{1}{4\pi\varepsilon_0}\right)`,
    GaussInt,
    r`V_b - V_a = -\int_a^b\vec E\cdot d\vec\ell`,
    Vq,
    Uqq,
    CQV,
    Iint,
    Jnqv,
    Jsig,
    VRI,
    RrL_,
    Fm,
    dFm,
    mu,
    tau,
    divB,
    Bq,
    dBbs,
    far,
    ampMax,
  ]),
  'p3-2025-2-diurno': prova([
    Fe,
    Ek2,
    r`\oint_{S = \partial\mathcal R}\vec E\cdot d\vec A = \frac{Q_\text{int}[\mathcal R]}{\varepsilon_0}`,
    grad,
    Vq,
    Uqq,
    CQV,
    r`I[S] = \int_S\vec J\cdot d\vec A`,
    Jnqv,
    Jsig,
    Fm,
    dFm,
    divB,
    Bq,
    dBbs,
    r`\mathcal E_\text{ind}[C \coloneqq \partial S] = -\frac{d\Phi_{\vec B}[S]}{dt}`,
    r`\oint_{C = \partial S}\vec B\cdot d\vec\ell = \mu_0I_\text{enc}[S] + \mu_0\varepsilon_0\frac{d\Phi_{\vec E}[S]}{dt}`,
  ]),
  'p3-2026-1-diurno': { ...FORMULARIO_P3, fonte: 'Formulário desta prova' },
  'pf-2023-1-noturno': prova(PF_2023),
  'sc-2023-1-noturno': prova(PF_2023),
  'sc-2023-2-diurno': prova(P3_2023),
  'sc-2024-1-diurno': prova([
    Fe_,
    Ek,
    GaussEnc,
    grad,
    Vint,
    UqV,
    Vq,
    Iint,
    Jsig,
    r`P = VI`,
    Jnqvd,
    VRI,
    RrL,
    CQV,
    Ceps,
    Ue,
    Fm_,
    dFm_,
    mu,
    tau,
    divB,
    BbsInt,
    r`\vec B = \left[\frac{\mu_0I}{2r}\right]\hat z`,
    ampMax2,
    far,
  ]),
}
