import { Meta, StoryObj } from '@storybook/react-vite';
import { HttpResponse, http } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { saker } from 'storybookData/saker/saker';

import { Forelder, StønadskontoType } from '@navikt/fp-constants';
import { OverføringÅrsakType, UttakArbeidType } from '@navikt/fp-types';
import { withQueryClient } from '@navikt/fp-utils-test';

import { OversiktRoutes } from '../../routes/routes';
import { DinPlan } from './DinPlan';

const meta = {
    title: 'DinPlan',
    component: DinPlan,
    decorators: [withQueryClient],
    render: (props) => {
        return (
            <MemoryRouter initialEntries={[`/${OversiktRoutes.DIN_PLAN}/352011079`]}>
                <Routes>
                    <Route element={<DinPlan {...props} />} path={`/${OversiktRoutes.DIN_PLAN}/:saksnummer`} />
                </Routes>
            </MemoryRouter>
        );
    },
} satisfies Meta<typeof DinPlan>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [http.get(`${import.meta.env.BASE_URL}/rest/innsyn/v2/saker`, () => HttpResponse.json(saker))],
        },
    },
    args: {
        annenPartsPerioder: [
            {
                fom: '2022-10-14',
                tom: '2022-12-21',
                kontoType: StønadskontoType.Fedrekvote,
                forelder: Forelder.farMedmor,
                samtidigUttak: 50,
            },
        ],
        navnPåForeldre: {
            mor: 'Helga',
            farMedmor: 'Espen',
        },
    },
};

export const FarSøker: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(`${import.meta.env.BASE_URL}/rest/innsyn/v2/saker`, () =>
                    HttpResponse.json({
                        foreldrepenger: [
                            {
                                oppdatertTidspunkt: '2024-02-28T21:19:08.911',
                                saksnummer: '352011079',
                                sakAvsluttet: false,
                                kanSøkeOmEndring: true,
                                sakTilhørerMor: false,
                                gjelderAdopsjon: false,
                                morUføretrygd: false,
                                harAnnenForelderTilsvarendeRettEØS: false,
                                ønskerJustertUttakVedFødsel: false,
                                rettighetType: 'BEGGE_RETT',
                                annenPart: {
                                    fnr: '03506715317',
                                },
                                familiehendelse: {
                                    fødselsdato: '2024-10-01',
                                    termindato: '2024-10-01',
                                    antallBarn: 1,
                                },
                                gjeldendeVedtak: {
                                    perioder: [
                                        {
                                            fom: '2024-10-01',
                                            tom: '2024-10-14',
                                            kontoType: StønadskontoType.Fedrekvote,
                                            forelder: Forelder.farMedmor,
                                            samtidigUttak: 100,
                                        },
                                        {
                                            fom: '2025-01-01',
                                            tom: '2025-02-04',
                                            forelder: Forelder.farMedmor,
                                            kontoType: StønadskontoType.Mødrekvote,
                                            overføringÅrsak: OverføringÅrsakType.institusjonsoppholdAnnenForelder,
                                        },
                                    ],
                                },
                                barn: [
                                    {
                                        fnr: '01472254177',
                                    },
                                ],
                                dekningsgrad: 'HUNDRE',
                            },
                        ],
                        engangsstønad: [],
                        svangerskapspenger: [],
                    }),
                ),
            ],
        },
    },
    args: {
        annenPartsPerioder: [
            {
                fom: '2024-09-10',
                tom: '2024-09-30',
                kontoType: StønadskontoType.ForeldrepengerFørFødsel,
                forelder: Forelder.mor,
            },
            {
                fom: '2024-10-01',
                tom: '2024-10-14',
                kontoType: StønadskontoType.Mødrekvote,
                forelder: Forelder.mor,
                samtidigUttak: 100,
            },
            {
                fom: '2024-10-15',
                tom: '2024-12-09',
                kontoType: StønadskontoType.Mødrekvote,
                forelder: Forelder.mor,
            },
            {
                fom: '2024-12-10',
                tom: '2024-12-31',
                kontoType: StønadskontoType.Fellesperiode,
                forelder: Forelder.mor,
            },
            {
                fom: '2025-02-05',
                tom: '2025-03-11',
                kontoType: StønadskontoType.Fellesperiode,
                forelder: Forelder.mor,
                gradering: {
                    arbeidstidprosent: 50,
                    aktivitet: {
                        type: UttakArbeidType.FRILANS,
                    },
                },
            },
            {
                fom: '2025-03-19',
                tom: '2025-04-22',
                kontoType: StønadskontoType.Fellesperiode,
                forelder: Forelder.mor,
            },
        ],
        navnPåForeldre: {
            mor: 'Helga',
            farMedmor: 'Espen',
        },
    },
};
