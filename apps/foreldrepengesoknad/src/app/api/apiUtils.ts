import * as Sentry from '@sentry/browser';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';

import {
    AnnenForelder,
    AnnenForelderIkkeOppgitt,
    Arbeidsform,
    Barn,
    Forelder,
    MorsAktivitet,
    Periode,
    Periodetype,
    Situasjon,
    StønadskontoType,
    Søkerrolle,
    Søkersituasjon,
    Utsettelsesperiode,
    UtsettelseÅrsakType,
    Uttaksdagen,
    UttaksperiodeBase,
    andreAugust2022ReglerGjelder,
    assertUnreachable,
    førsteOktober2021ReglerGjelder,
    guid,
    isAdoptertBarn,
    isAdoptertStebarn,
    isAnnenForelderOppgitt,
    isFarEllerMedmor,
    isForeldrepengerFørFødselUttaksperiode,
    isFødtBarn,
    isUttaksperiode,
    isValidTidsperiode,
    sorterPerioder,
} from '@navikt/fp-common';
import { ArbeidsforholdOgInntektFp } from '@navikt/fp-steg-arbeidsforhold-og-inntekt/src/types/ArbeidsforholdOgInntekt';
import { EgenNæring } from '@navikt/fp-steg-egen-naering';
import { Frilans } from '@navikt/fp-steg-frilans';
import { Attachment, LocaleNo } from '@navikt/fp-types';
import { uttaksperiodeKanJusteresVedFødsel } from '@navikt/fp-uttaksplan';
import { notEmpty } from '@navikt/fp-validation';

import { ContextDataMap, ContextDataType } from 'app/appData/FpDataContext';
import { AndreInntektskilder, AnnenInntektType } from 'app/types/AndreInntektskilder';
import { AnnenInntekt } from 'app/types/AnnenInntekt';
import { GyldigeSkjemanummer } from 'app/types/GyldigeSkjemanummer';
import { Næring } from 'app/types/Næring';
import { Søknad } from 'app/types/Søknad';
import { VedleggDataType } from 'app/types/VedleggDataType';
import { getTermindato } from 'app/utils/barnUtils';

export interface AnnenForelderOppgittForInnsending
    extends Omit<
        AnnenForelder,
        'erMorUfør' | 'harRettPåForeldrepengerINorge' | 'harOppholdtSegIEØS' | 'harRettPåForeldrepengerIEØS'
    > {
    harMorUføretrygd?: boolean;
    harRettPåForeldrepenger?: boolean;
    harAnnenForelderOppholdtSegIEØS?: boolean;
    harAnnenForelderTilsvarendeRettEØS?: boolean;
}

export type AnnenForelderForInnsending = AnnenForelderIkkeOppgitt | AnnenForelderOppgittForInnsending;

export interface JusterbarPeriodeForInnsending {
    justeresVedFødsel?: boolean;
}

export type UttaksPeriodeForInnsending = Omit<UttaksperiodeBase, 'erMorForSyk'> & JusterbarPeriodeForInnsending;

export type PeriodeForInnsending = Exclude<Periode, 'Uttaksperiode'> | UttaksPeriodeForInnsending;

export type LocaleForInnsending = 'NB' | 'NN' | 'nb' | 'nn';

export type SøkerrolleInnsending = 'MOR' | 'FAR' | 'MEDMOR';

interface BarnPropsForAPI {
    adopsjonAvEktefellesBarn?: boolean;
}

export type BarnForInnsending = Omit<Barn, 'datoForAleneomsorg' | 'type'> & BarnPropsForAPI;

export interface SøkerForInnsending {
    erAleneOmOmsorg: boolean;
    språkkode: LocaleForInnsending;
    rolle: SøkerrolleInnsending;
    selvstendigNæringsdrivendeInformasjon?: Næring[];
    frilansInformasjon?: Frilans;
    andreInntekterSiste10Mnd?: AnnenInntekt[];
}

export interface SøknadForInnsending
    extends Omit<
        Søknad,
        | 'barn'
        | 'annenForelder'
        | 'uttaksplan'
        | 'arbeidsforholdOgInntekt'
        | 'egenNæring'
        | 'frilans'
        | 'andreInntektskilder'
        | 'søkersituasjon'
        | 'tilleggsopplysninger'
        | 'manglerDokumentasjon'
        | 'vedlegg'
    > {
    barn: BarnForInnsending;
    annenForelder: AnnenForelderForInnsending;
    uttaksplan: PeriodeForInnsending[];
    søker: SøkerForInnsending;
    situasjon: Situasjon;
    vedlegg: Attachment[];
}

export type EndringssøknadForInnsending = Pick<
    SøknadForInnsending,
    | 'type'
    | 'saksnummer'
    | 'erEndringssøknad'
    | 'uttaksplan'
    | 'søker'
    | 'annenForelder'
    | 'barn'
    | 'dekningsgrad'
    | 'situasjon'
    | 'ønskerJustertUttakVedFødsel'
    | 'vedlegg'
>;

export const FEIL_VED_INNSENDING =
    'Det har oppstått et problem med innsending av søknaden. Vennligst prøv igjen senere. Hvis problemet vedvarer, kontakt oss og oppgi feil id: ';

export const UKJENT_UUID = 'ukjent uuid';

const getUttaksperiodeForInnsending = (
    uttaksPeriode: UttaksperiodeBase,
    ønskerJustertUttakVedFødsel: boolean | undefined,
    termindato: string | undefined,
): UttaksPeriodeForInnsending => {
    const cleanedPeriode = changeGradertUttaksPeriode(cleanUttaksperiode(uttaksPeriode));
    if (uttaksperiodeKanJusteresVedFødsel(ønskerJustertUttakVedFødsel, termindato, uttaksPeriode.tidsperiode.fom)) {
        return { ...cleanedPeriode, justeresVedFødsel: true };
    }
    return cleanedPeriode;
};

const cleanUttaksperiode = (uttaksPeriode: UttaksperiodeBase): UttaksPeriodeForInnsending => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { erMorForSyk, ...periodeRest } = uttaksPeriode;
    return periodeRest;
};

const isNotPeriodetypeHull = (periode: Periode): boolean => {
    return periode.type !== Periodetype.Hull;
};

const isNotPeriodetypeInfo = (periode: Periode): boolean => {
    return periode.type !== Periodetype.Info;
};

const isNotPeriodeUtenUttak = (periode: Periode): boolean => {
    return periode.type !== Periodetype.PeriodeUtenUttak;
};

const skalPeriodeSendesInn = (periode: Periode) => {
    if (isForeldrepengerFørFødselUttaksperiode(periode)) {
        return !periode.skalIkkeHaUttakFørTermin;
    }

    return (
        isNotPeriodetypeHull(periode) &&
        isNotPeriodetypeInfo(periode) &&
        isNotPeriodeUtenUttak(periode) &&
        !(isUttaksperiode(periode) && periode.konto === undefined)
    );
};

const cleanAnnenForelder = (annenForelder: AnnenForelder, erEndringssøknad = false): AnnenForelderForInnsending => {
    if (isAnnenForelderOppgitt(annenForelder)) {
        const {
            erMorUfør,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            erForSyk,
            harRettPåForeldrepengerINorge,
            harRettPåForeldrepengerIEØS,
            harOppholdtSegIEØS,
            ...annenForelderRest
        } = annenForelder;
        const cleanedAnnenForelder = {
            harMorUføretrygd: erMorUfør,
            harRettPåForeldrepenger: harRettPåForeldrepengerINorge,
            ...annenForelderRest,
        };
        if (harRettPåForeldrepengerINorge) {
            return { ...cleanedAnnenForelder, erInformertOmSøknaden: true } as AnnenForelderOppgittForInnsending;
        }
        if (harOppholdtSegIEØS) {
            return {
                ...cleanedAnnenForelder,
                harAnnenForelderOppholdtSegIEØS: harOppholdtSegIEØS,
                harAnnenForelderTilsvarendeRettEØS: harRettPåForeldrepengerIEØS,
            };
        } else if (erEndringssøknad) {
            return { ...cleanedAnnenForelder, harAnnenForelderTilsvarendeRettEØS: harRettPåForeldrepengerIEØS };
        } else {
            return { ...cleanedAnnenForelder, harAnnenForelderOppholdtSegIEØS: harOppholdtSegIEØS };
        }
    }
    return annenForelder;
};

const cleanBarn = (barn: Barn): BarnForInnsending => {
    if (isFødtBarn(barn)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type, fnr, ...barnRest } = barn;
        return barnRest;
    }

    if (isAdoptertBarn(barn)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type, fnr, ...barnRest } = barn;
        return {
            adopsjonAvEktefellesBarn: isAdoptertStebarn(barn),
            ...barnRest,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...barnRest } = barn;
    return barnRest;
};

const konverterRolle = (rolle: Søkerrolle): SøkerrolleInnsending => {
    switch (rolle) {
        case 'mor':
            return 'MOR';
        case 'far':
            return 'FAR';
        case 'medmor':
            return 'MEDMOR';
        default:
            return assertUnreachable(rolle, 'Søkerrolle er ikke satt');
    }
};

const changeClientonlyKontotype = (
    periode: Periode,
    annenForelderHarRettPåForeldrepengerINorge: boolean,
    morErUfør: boolean,
    søkerErFarEllerMedmor: boolean,
    familiehendelsesdato: string,
) => {
    if (isUttaksperiode(periode)) {
        if (periode.konto === StønadskontoType.Flerbarnsdager) {
            periode.konto = !annenForelderHarRettPåForeldrepengerINorge
                ? StønadskontoType.Foreldrepenger
                : StønadskontoType.Fellesperiode;
        }
        if (periode.konto === StønadskontoType.AktivitetsfriKvote) {
            periode.konto = StønadskontoType.Foreldrepenger;
            if (
                søkerErFarEllerMedmor &&
                !annenForelderHarRettPåForeldrepengerINorge &&
                andreAugust2022ReglerGjelder(familiehendelsesdato)
            ) {
                periode.morsAktivitetIPerioden = MorsAktivitet.IkkeOppgitt;
            } else if (morErUfør) {
                periode.morsAktivitetIPerioden = MorsAktivitet.Uføre;
            }
        }
    }
    return periode;
};

const getArbeidstakerFrilansSN = (arbeidsformer: Arbeidsform[] | undefined) => {
    if (arbeidsformer !== undefined && arbeidsformer.length > 0) {
        const arbeidsform = arbeidsformer[0];
        return {
            erArbeidstaker: arbeidsform === Arbeidsform.arbeidstaker,
            erFrilanser: arbeidsform === Arbeidsform.frilans,
            erSelvstendig: arbeidsform === Arbeidsform.selvstendignæringsdrivende,
        };
    } else {
        return {};
    }
};

const changeGradertUttaksPeriode = (periode: UttaksPeriodeForInnsending): UttaksPeriodeForInnsending => {
    if (periode.gradert) {
        return { ...periode, ...getArbeidstakerFrilansSN(periode.arbeidsformer) };
    }
    return periode;
};

const cleanUttaksplan = (
    plan: Periode[],
    familiehendelsesdato: string,
    søkerErFarEllerMedmor: boolean,
    ønskerJustertUttakVedFødsel: boolean | undefined,
    termindato: string | undefined,
    annenForelder?: AnnenForelder,
    endringstidspunkt?: Date,
): PeriodeForInnsending[] => {
    const uttaksplan = plan.map((periode) => {
        return { ...periode };
    });
    const cleanedUttaksplan = uttaksplan
        .filter((periode: Periode) => isValidTidsperiode(periode.tidsperiode))
        .filter(skalPeriodeSendesInn)
        .map((periode) =>
            annenForelder && isAnnenForelderOppgitt(annenForelder)
                ? changeClientonlyKontotype(
                      periode,
                      !!annenForelder.harRettPåForeldrepengerINorge,
                      !!annenForelder.erMorUfør,
                      søkerErFarEllerMedmor,
                      familiehendelsesdato,
                  )
                : periode,
        )
        .map((periode) =>
            periode.type === Periodetype.Uttak
                ? getUttaksperiodeForInnsending(periode, ønskerJustertUttakVedFødsel, termindato)
                : periode,
        );

    if (endringstidspunkt && førsteOktober2021ReglerGjelder(familiehendelsesdato)) {
        const periodeVedEndringstidspunkt = getPeriodeVedTidspunkt(cleanedUttaksplan, endringstidspunkt);

        if (!periodeVedEndringstidspunkt) {
            return getUttaksplanMedFriUtsettelsesperiode(cleanedUttaksplan, endringstidspunkt);
        }
    }

    return cleanedUttaksplan;
};

export const getPeriodeVedTidspunkt = (uttaksplan: Periode[], tidspunkt: Date): Periode | undefined => {
    return uttaksplan.find((periode) =>
        dayjs(tidspunkt).isBetween(periode.tidsperiode.fom, periode.tidsperiode.tom, 'day', '[]'),
    );
};

export const getUttaksplanMedFriUtsettelsesperiode = (uttaksplan: Periode[], endringstidspunkt: Date): Periode[] => {
    const førstePeriodeEtterEndringstidspunkt = uttaksplan.find((periode) =>
        dayjs(periode.tidsperiode.fom).isAfter(endringstidspunkt, 'day'),
    );

    const endringsTidspunktPeriodeTom = førstePeriodeEtterEndringstidspunkt
        ? Uttaksdagen(førstePeriodeEtterEndringstidspunkt.tidsperiode.fom).forrige()
        : endringstidspunkt;

    const endringsTidspunktPeriode: Utsettelsesperiode = {
        type: Periodetype.Utsettelse,
        årsak: UtsettelseÅrsakType.Fri,
        id: guid(),
        tidsperiode: {
            fom: endringstidspunkt,
            tom: endringsTidspunktPeriodeTom,
        },
        erArbeidstaker: false,
        forelder: Forelder.farMedmor,
    };

    uttaksplan.push(endringsTidspunktPeriode);

    uttaksplan.sort(sorterPerioder);

    return uttaksplan;
};

export const convertAttachmentsMapToArray = (vedlegg: VedleggDataType | undefined): Attachment[] => {
    if (!vedlegg) {
        return [];
    }

    const vedleggArray: Attachment[] = [];

    Object.keys(vedlegg).forEach((key: unknown) => {
        const vedleggAvTypeSkjemanummer = vedlegg[key as GyldigeSkjemanummer];

        if (vedleggAvTypeSkjemanummer && vedleggAvTypeSkjemanummer.length > 0) {
            vedleggArray.push(...vedleggAvTypeSkjemanummer);
        }
    });

    return vedleggArray;
};

export const cleanSøknad = (
    hentData: <TYPE extends ContextDataType>(key: TYPE) => ContextDataMap[TYPE],
    familiehendelsesdato: string,
    locale: LocaleNo,
): SøknadForInnsending => {
    const annenForelder = notEmpty(hentData(ContextDataType.ANNEN_FORELDER));
    const barn = notEmpty(hentData(ContextDataType.OM_BARNET));
    const arbeidsforholdOgInntekt = notEmpty(hentData(ContextDataType.ARBEIDSFORHOLD_OG_INNTEKT));
    const frilans = hentData(ContextDataType.FRILANS);
    const egenNæring = hentData(ContextDataType.EGEN_NÆRING);
    const andreInntektskilder = hentData(ContextDataType.ANDRE_INNTEKTSKILDER);
    const søkersituasjon = notEmpty(hentData(ContextDataType.SØKERSITUASJON));
    const utenlandsopphold = notEmpty(hentData(ContextDataType.UTENLANDSOPPHOLD));
    const periodeMedForeldrepenger = notEmpty(hentData(ContextDataType.PERIODE_MED_FORELDREPENGER));
    const senereUtenlandsopphold = hentData(ContextDataType.UTENLANDSOPPHOLD_SENERE);
    const tidligereUtenlandsopphold = hentData(ContextDataType.UTENLANDSOPPHOLD_TIDLIGERE);
    const uttaksplan = notEmpty(hentData(ContextDataType.UTTAKSPLAN));
    const uttaksplanMetadata = notEmpty(hentData(ContextDataType.UTTAKSPLAN_METADATA));
    const eksisterendeSak = hentData(ContextDataType.EKSISTERENDE_SAK);
    const vedlegg = hentData(ContextDataType.VEDLEGG);

    const annenForelderInnsending = cleanAnnenForelder(annenForelder);
    const søkerInnsending = cleanSøker(
        søkersituasjon,
        locale,
        annenForelder,
        arbeidsforholdOgInntekt,
        frilans,
        egenNæring,
        andreInntektskilder,
    );
    const barnInnsending = cleanBarn(barn);
    const søkerErFarEllerMedmor = isFarEllerMedmor(søkersituasjon.rolle);
    const termindato = getTermindato(barn);
    const uttaksplanInnsending = cleanUttaksplan(
        uttaksplan,
        familiehendelsesdato,
        søkerErFarEllerMedmor,
        uttaksplanMetadata.ønskerJustertUttakVedFødsel,
        termindato,
        annenForelder,
    );
    const cleanedSøknad: SøknadForInnsending = {
        type: 'foreldrepenger',
        harGodkjentVilkår: true,
        saksnummer: eksisterendeSak?.saksnummer,
        erEndringssøknad: false,
        søker: søkerInnsending,
        barn: barnInnsending,
        situasjon: søkersituasjon.situasjon,
        annenForelder: annenForelderInnsending,
        uttaksplan: uttaksplanInnsending,
        informasjonOmUtenlandsopphold: {
            ...utenlandsopphold,
            ...(senereUtenlandsopphold || { senereOpphold: [] }),
            ...(tidligereUtenlandsopphold || { tidligereOpphold: [] }),
        },
        dekningsgrad: periodeMedForeldrepenger.dekningsgrad,
        ønskerJustertUttakVedFødsel: uttaksplanMetadata.ønskerJustertUttakVedFødsel,
        vedlegg: convertAttachmentsMapToArray(vedlegg),
    };

    return cleanedSøknad;
};

const cleanSøker = (
    søkersituasjon: Søkersituasjon,
    locale: LocaleNo,
    annenForelder: AnnenForelder,
    arbeidsforholdOgInntekt: ArbeidsforholdOgInntektFp,
    frilans?: Frilans,
    egenNæring?: EgenNæring,
    andreInntektskilder?: AndreInntektskilder[],
): SøkerForInnsending => {
    const rolle = konverterRolle(søkersituasjon.rolle);
    const erOppgitt = isAnnenForelderOppgitt(annenForelder);

    const common = {
        rolle: rolle,
        språkkode: locale,
        erAleneOmOmsorg: erOppgitt ? annenForelder.erAleneOmOmsorg : true,
    };

    if (
        arbeidsforholdOgInntekt.harJobbetSomFrilans ||
        arbeidsforholdOgInntekt.harHattAndreInntektskilder ||
        arbeidsforholdOgInntekt.harHattAndreInntektskilder
    ) {
        return {
            ...common,
            andreInntekterSiste10Mnd: andreInntektskilder?.map((i) => ({
                ...i,
                tidsperiode: {
                    fom: i.fom,
                    tom: i.tom,
                    pågående: i.type === AnnenInntektType.SLUTTPAKKE ? false : i.pågående,
                },
                pågående: i.type === AnnenInntektType.SLUTTPAKKE ? false : i.pågående,
            })),
            frilansInformasjon: frilans,
            selvstendigNæringsdrivendeInformasjon: egenNæring
                ? [
                      {
                          næringstyper: [egenNæring.næringstype],
                          tidsperiode: {
                              fom: egenNæring.fomDato,
                              tom: egenNæring.tomDato,
                          },
                          navnPåNæringen: egenNæring.navnPåNæringen!,
                          ...egenNæring,
                      },
                  ]
                : [],
        };
    }
    return { ...common, andreInntekterSiste10Mnd: [], selvstendigNæringsdrivendeInformasjon: [] };
};

export const getSøknadsdataForInnsending = (
    erEndringssøknad: boolean,
    hentData: <TYPE extends ContextDataType>(key: TYPE) => ContextDataMap[TYPE],
    endringerIUttaksplan: Periode[],
    familiehendelsesdato: string,
    locale: LocaleNo,
    endringstidspunkt?: Date,
): SøknadForInnsending | EndringssøknadForInnsending => {
    if (erEndringssøknad) {
        return cleanEndringssøknad(hentData, endringerIUttaksplan, familiehendelsesdato, locale, endringstidspunkt);
    } else {
        return cleanSøknad(hentData, familiehendelsesdato, locale);
    }
};

export const cleanEndringssøknad = (
    hentData: <TYPE extends ContextDataType>(key: TYPE) => ContextDataMap[TYPE],
    endringerIUttaksplan: Periode[],
    familiehendelsesdato: string,
    locale: LocaleNo,
    endringstidspunkt?: Date,
): EndringssøknadForInnsending => {
    const uttaksplanMetadata = notEmpty(hentData(ContextDataType.UTTAKSPLAN_METADATA));
    const annenForelder = notEmpty(hentData(ContextDataType.ANNEN_FORELDER));
    const barn = notEmpty(hentData(ContextDataType.OM_BARNET));
    const arbeidsforholdOgInntekt = notEmpty(hentData(ContextDataType.ARBEIDSFORHOLD_OG_INNTEKT));
    const frilans = hentData(ContextDataType.FRILANS);
    const egenNæring = hentData(ContextDataType.EGEN_NÆRING);
    const andreInntektskilder = hentData(ContextDataType.ANDRE_INNTEKTSKILDER);
    const periodeMedForeldrepenger = notEmpty(hentData(ContextDataType.PERIODE_MED_FORELDREPENGER));
    const søkersituasjon = notEmpty(hentData(ContextDataType.SØKERSITUASJON));
    const eksisterendeSak = notEmpty(hentData(ContextDataType.EKSISTERENDE_SAK));
    const søkerErFarEllerMedmor = isFarEllerMedmor(søkersituasjon.rolle);
    const termindato = getTermindato(barn);
    const vedlegg = hentData(ContextDataType.VEDLEGG);

    const cleanedSøknad: EndringssøknadForInnsending = {
        type: 'foreldrepenger',
        erEndringssøknad: true,
        saksnummer: eksisterendeSak.saksnummer,
        uttaksplan: cleanUttaksplan(
            endringerIUttaksplan,
            familiehendelsesdato,
            søkerErFarEllerMedmor,
            uttaksplanMetadata.ønskerJustertUttakVedFødsel,
            termindato,
            annenForelder,
            endringstidspunkt,
        ),
        søker: cleanSøker(
            søkersituasjon,
            locale,
            annenForelder,
            arbeidsforholdOgInntekt,
            frilans,
            egenNæring,
            andreInntektskilder,
        ),
        annenForelder: cleanAnnenForelder(annenForelder, true),
        barn,
        dekningsgrad: periodeMedForeldrepenger.dekningsgrad,
        situasjon: søkersituasjon.situasjon,
        ønskerJustertUttakVedFødsel: uttaksplanMetadata.ønskerJustertUttakVedFødsel,
        vedlegg: convertAttachmentsMapToArray(vedlegg),
    };

    return cleanedSøknad;
};

const hideNumbersAndTrim = (tekst: string): string => {
    return tekst.replace(/\d/g, '*').slice(0, 250) + '...';
};

export const sendErrorMessageToSentry = (error: AxiosError<any>) => {
    const errorCallId = getErrorCallId(error) + '. ';
    const errorTimestamp = getErrorTimestamp(error) + '. ';

    let errorString = errorCallId + errorTimestamp;

    const errorMessages = error.request?.data?.messages ?? error.response?.data?.messages;
    const isErrorMessageArray = Array.isArray(errorMessages);

    if (isErrorMessageArray && errorMessages.length > 0) {
        errorString = errorString + hideNumbersAndTrim(errorMessages[0]);
    }
    if (!isErrorMessageArray && errorMessages) {
        errorString = errorString + hideNumbersAndTrim(errorMessages);
    }
    if (error.message) {
        errorString = errorString + error.message;
    }

    Sentry.captureMessage(errorString);
};

export const getErrorCallId = (error: AxiosError<any>): string => {
    return error.response?.data?.uuid ? error.response.data.uuid : UKJENT_UUID;
};

export const getErrorTimestamp = (error: AxiosError<any>): string => {
    return error.response?.data?.timestamp ? error.response.data.timestamp : '';
};
