import {
    UttaksplanValideringActionTypes,
    UttaksplanValideringActionKeys
} from '../actions/uttaksplanValidering/uttaksplanValideringActionDefinitions';
import { Periode } from '../../types/uttaksplan/periodetyper';
import { Stønadskontouttak } from '../../components/uttaksoppsummering/Uttaksoppsummering';

export enum PeriodeValideringErrorKey {
    'PÅKREVD_VERDI_MANGLER' = 'påkrevd',
    'SKJEMA_IKKE_KOMPLETT' = 'skjemaIkkeKomplett',
    'UGYLDIG_TIDSPERIODE' = 'ugyldigTidsperiode',
    'DATO_IKKE_UTTAKSDAG' = 'datoErIkkeUttaksdag',
    'UGYLDIG_GRADERING_VERDI' = 'ugyldigGraderingVerdi',
    'UGYLDIG_SAMTIDIG_UTTAK_PROSENT' = 'ugyldigSamtidigUttakProsent',
    'UGYLDIG_ÅRSAK_OG_TIDSPERIODE' = 'ugyldigÅrsakOgTidsperiode'
}

export enum PeriodeAdvarselKey {
    'MANGLENDE_VEDLEGG' = 'manglendeVedlegg'
}

export interface Periodevalidering {
    [periodeId: string]: ValidertPeriode;
}

export interface UttaksplanValideringState {
    periodevalidering: Periodevalidering;
    inneholderPerioder: boolean;
    stønadskontoerMedForMyeUttak: Stønadskontouttak[];
    erGyldig: boolean;
    morHarSøktUgyldigUtsettelseFørsteSeksUker: boolean;
    farHarSøktUgyldigUtsettelseFørsteSeksUker: boolean;
    uttaksmengdeForFarMedmorForHøy: boolean;
    uttakErBareOpphold: boolean;
    uttaksplanStarterMedOpphold: boolean;
    uttaksplanSlutterMedOpphold: boolean;
    uttaksplanGraderingStørreEnnSamtidigUttak: boolean;
}

export interface PeriodeValideringsfeil {
    feilKey: PeriodeValideringErrorKey;
}

export interface PeriodeAdvarsel {
    advarselKey: PeriodeAdvarselKey;
}

export interface ValidertPeriode {
    periodeId: string;
    valideringsfeil: PeriodeValideringsfeil[];
    advarsler: PeriodeAdvarsel[];
    overlappendePerioder: Periode[];
}

const getDefaultState = (): UttaksplanValideringState => {
    return {
        periodevalidering: {},
        inneholderPerioder: false,
        stønadskontoerMedForMyeUttak: [],
        erGyldig: true,
        morHarSøktUgyldigUtsettelseFørsteSeksUker: false,
        farHarSøktUgyldigUtsettelseFørsteSeksUker: false,
        uttaksmengdeForFarMedmorForHøy: false,
        uttakErBareOpphold: false,
        uttaksplanStarterMedOpphold: false,
        uttaksplanSlutterMedOpphold: false,
        uttaksplanGraderingStørreEnnSamtidigUttak: false
    };
};

const periodeneErGyldige = (periodevalidering: Periodevalidering) =>
    Object.keys(periodevalidering).find(
        (key) =>
            periodevalidering[key].overlappendePerioder.length > 0 || periodevalidering[key].valideringsfeil.length > 0
    ) === undefined;

const uttaksplanValideringReducer = (
    state = getDefaultState(),
    action: UttaksplanValideringActionTypes
): UttaksplanValideringState => {
    switch (action.type) {
        case UttaksplanValideringActionKeys.SET_UTTAKSPLAN_VALIDERING:
            const erGyldig =
                periodeneErGyldige(action.validertePerioder) &&
                action.inneholderPerioder &&
                action.stønadskontoerMedForMyeUttak.length === 0 &&
                action.morHarSøktUgyldigUtsettelseFørsteSeksUker === false &&
                action.farHarSøktUgyldigUtsettelseFørsteSeksUker === false &&
                action.uttaksmengdeForFarMedmorForHøy === false &&
                action.uttakErBareOpphold === false &&
                action.uttaksplanStarterMedOpphold === false &&
                action.uttaksplanSlutterMedOpphold === false &&
                action.uttaksplanGraderingStørreEnnSamtidigUttak === false;
            return {
                ...state,
                periodevalidering: action.validertePerioder,
                inneholderPerioder: action.inneholderPerioder,
                stønadskontoerMedForMyeUttak: action.stønadskontoerMedForMyeUttak,
                morHarSøktUgyldigUtsettelseFørsteSeksUker: action.morHarSøktUgyldigUtsettelseFørsteSeksUker,
                farHarSøktUgyldigUtsettelseFørsteSeksUker: action.farHarSøktUgyldigUtsettelseFørsteSeksUker,
                erGyldig,
                uttaksmengdeForFarMedmorForHøy: action.uttaksmengdeForFarMedmorForHøy === true,
                uttakErBareOpphold: action.uttakErBareOpphold === true,
                uttaksplanStarterMedOpphold: action.uttaksplanStarterMedOpphold === true,
                uttaksplanSlutterMedOpphold: action.uttaksplanSlutterMedOpphold === true,
                uttaksplanGraderingStørreEnnSamtidigUttak: action.uttaksplanGraderingStørreEnnSamtidigUttak === true
            };
    }
    return state;
};

export default uttaksplanValideringReducer;
