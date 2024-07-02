import { StønadskontoType } from '@navikt/fp-constants';
import { TilgjengeligeStønadskontoerForDekningsgrad } from '@navikt/fp-types';

export type UkerOgDager = {
    uker: number;
    dager: number;
};

export const getAntallUker = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number => {
    return Object.values(stønadskontoer.kontoer).reduce((sum: number, konto) => sum + konto.dager / 5, 0);
};

const getUkerForKonto = (
    stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad,
    stønadskontoType: StønadskontoType,
) => {
    const konto = stønadskontoer.kontoer.find((k) => k.konto === stønadskontoType);
    return konto ? konto.dager / 5 : 0;
};

const getUkerOgDagerForKonto = (
    stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad,
    stønadskontoType: StønadskontoType,
): UkerOgDager => {
    const konto = stønadskontoer.kontoer.find((k) => k.konto === stønadskontoType);

    if (konto) {
        const uker = Math.floor(konto.dager / 5);
        return { uker, dager: konto.dager - uker * 5 };
    }

    return { uker: 0, dager: 0 };
};

export const getAntallUkerForeldrepengerFørFødsel = (
    stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad,
): number => getUkerForKonto(stønadskontoer, StønadskontoType.ForeldrepengerFørFødsel);

export const getAntallUkerMødrekvote = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number =>
    getUkerForKonto(stønadskontoer, StønadskontoType.Mødrekvote);

export const getAntallUkerFedrekvote = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number =>
    getUkerForKonto(stønadskontoer, StønadskontoType.Fedrekvote);

export const getAntallUkerFellesperiode = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number =>
    getUkerForKonto(stønadskontoer, StønadskontoType.Fellesperiode);

export const getAntallUkerOgDagerFellesperiode = (
    stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad,
): UkerOgDager => getUkerOgDagerForKonto(stønadskontoer, StønadskontoType.Fellesperiode);

export const getAntallUkerForeldrepenger = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number =>
    getUkerForKonto(stønadskontoer, StønadskontoType.Foreldrepenger);

export const getAntallUkerAktivitetsfriKvote = (stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad): number =>
    getUkerForKonto(stønadskontoer, StønadskontoType.AktivitetsfriKvote);
