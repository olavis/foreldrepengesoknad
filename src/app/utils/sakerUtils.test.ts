import Behandling, {
    BehandlingResultatType,
    BehandlingStatus,
    BehandlingTema,
    BehandlingType,
} from 'app/types/Behandling';
import Sak, { FagsakStatus, SakType } from 'app/types/Sak';
import { getSakForEndringssøknad } from './sakerUtils';

export const engangssønadBehandligMock: Behandling = {
    opprettetTidspunkt: '2019-01-01',
    endretTidspunkt: '2019-01-02',
    behandlendeEnhet: '4833',
    behandlendeEnhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1',
    status: BehandlingStatus.OPPRETTET,
    tema: BehandlingTema.ENGANGSSTØNAD,
    type: BehandlingType.ENGANGSSTØNAD,
    behandlingResultat: BehandlingResultatType.INNVILGET,
    inntektsmeldinger: [],
};

export const foreldrepengesoknadBehandlingMock: Behandling = {
    opprettetTidspunkt: '2019-01-01',
    endretTidspunkt: '2019-01-02',
    behandlendeEnhet: '4833',
    behandlendeEnhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1',
    status: BehandlingStatus.AVSLUTTET,
    tema: BehandlingTema.FORELDREPENGER,
    type: BehandlingType.FORELDREPENGESØKNAD,
    behandlingResultat: BehandlingResultatType.INNVILGET,
    inntektsmeldinger: [],
};

export const svpBehandligMock: Behandling = {
    opprettetTidspunkt: '2019-01-01',
    endretTidspunkt: '2019-01-02',
    behandlendeEnhet: '4833',
    behandlendeEnhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1',
    status: BehandlingStatus.OPPRETTET,
    tema: BehandlingTema.UDEFINERT,
    type: BehandlingType.SVANGERSKAPSPENGESØKNAD,
    behandlingResultat: BehandlingResultatType.INNVILGET,
    inntektsmeldinger: [],
};

export const endringssøknadBehandligMock: Behandling = {
    opprettetTidspunkt: '2019-01-01',
    endretTidspunkt: '2019-01-02',
    behandlendeEnhet: '4833',
    behandlendeEnhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1',
    status: BehandlingStatus.OPPRETTET,
    tema: BehandlingTema.FORELDREPENGER,
    type: BehandlingType.FORELDREPENGESØKNAD,
    behandlingResultat: BehandlingResultatType.INNVILGET,
    inntektsmeldinger: [],
};

const infotrygd: Sak = {
    type: SakType.SAK,
    saksnummer: '123',
    opprettet: '2018-09-01',
};

const fpsakSVP: Sak = {
    type: SakType.FPSAK,
    saksnummer: '234',
    opprettet: '2018-10-01',
    status: FagsakStatus.OPPRETTET,
    behandlinger: [svpBehandligMock],
};

const fpsakFP: Sak = {
    type: SakType.FPSAK,
    saksnummer: '234',
    opprettet: '2018-10-01',
    status: FagsakStatus.OPPRETTET,
    behandlinger: [foreldrepengesoknadBehandlingMock],
};

const fpsakES: Sak = {
    type: SakType.FPSAK,
    saksnummer: '234',
    opprettet: '2018-10-01',
    status: FagsakStatus.OPPRETTET,
    behandlinger: [engangssønadBehandligMock],
};

const fpsakEndring: Sak = {
    type: SakType.FPSAK,
    saksnummer: '234',
    opprettet: '2018-10-01',
    status: FagsakStatus.OPPRETTET,
    behandlinger: [endringssøknadBehandligMock],
};

const SakerMock = { fpsakSVP, fpsakES, fpsakFP, fpsakEndring, infotrygd };
export default SakerMock;

describe('sakerUtils', () => {
    describe('saker for endringssøknad', () => {
        it('skal ikke kunne søke om endring hvis nyeste sak er en svangerskapepengesak eller engangssønad', () => {
            expect(getSakForEndringssøknad([SakerMock.fpsakSVP])).toBeUndefined();
            expect(getSakForEndringssøknad([SakerMock.fpsakES])).toBeUndefined();
        });

        it('skal ikke kunne søke om endring på avsluttet sak', () => {
            expect(getSakForEndringssøknad([{ ...SakerMock.fpsakFP, status: FagsakStatus.AVSLUTTET }])).toBeUndefined();
        });

        it('skal kunne søke om endring med sak som ikke er avluttet og har en avsluttet behandlig', () => {
            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.LOPENDE,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();
            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.LOPENDE,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();
            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.LOPENDE,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();
        });

        it('skal kunne søke om endring hvis saken ikke er avsluttet og har en avsluttet behandlig', () => {
            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.OPPRETTET,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();

            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.UNDER_BEHANDLING,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();

            expect(
                getSakForEndringssøknad([
                    {
                        ...SakerMock.fpsakFP,
                        opprettet: FagsakStatus.LOPENDE,
                        behandlinger: [{ ...foreldrepengesoknadBehandlingMock, status: BehandlingStatus.AVSLUTTET }],
                    },
                ])
            ).toBeDefined();
        });
    });
});
