import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { formatDate } from '@navikt/fp-utils';

import { Tidsperioden } from './Tidsperioden';

dayjs.extend(isoWeek);

/**
 * Wrapper en dato med uttaksdager-funksjonalitet
 * @param dato
 */
export const Uttaksdagen = (dato: Date) => ({
    erUttaksdag: (): boolean => erUttaksdag(dato),
    forrige: (): Date => getUttaksdagFørDato(dato),
    neste: (): Date => getUttaksdagEtterDato(dato),
    denneEllerNeste: (): Date => getUttaksdagFraOgMedDato(dato),
    denneEllerForrige: (): Date => getUttaksdagTilOgMedDato(dato),
    getUttaksdagerFremTilDato: (tildato: Date) => getUttaksdagerFremTilDato(dato, tildato),
    leggTil: (uttaksdager: number): Date => {
        if (uttaksdager < 0) {
            return trekkUttaksdagerFraDato(dato, uttaksdager);
        } else if (uttaksdager > 0) {
            return leggUttaksdagerTilDato(dato, uttaksdager);
        }
        return dato;
    },
    trekkFra: (uttaksdager: number): Date => trekkUttaksdagerFraDato(dato, uttaksdager),
});

function getUkedag(dato: Date): number {
    return dayjs(dato).isoWeekday();
}

export function erUttaksdag(dato: Date): boolean {
    return getUkedag(dato) !== 6 && getUkedag(dato) !== 7;
}

function getUttaksdagFørDato(dato: Date): Date {
    return getUttaksdagTilOgMedDato(dayjs.utc(dato).subtract(24, 'hours').toDate());
}

/**
 * Sjekker om dato er en ukedag, dersom ikke finner den foregående fredag.
 * Tar hensyn til stilling av klokken ved å gjøre om klokka til kl 12 før antall timer trekkes fra.
 * @param dato
 */
function getUttaksdagTilOgMedDato(dato: Date): Date {
    const newDate = dato ? new Date(dato.getFullYear(), dato.getMonth(), dato.getDate(), 12) : dato;
    switch (getUkedag(dato)) {
        case 6:
            return dayjs.utc(newDate).subtract(24, 'hours').startOf('day').toDate();
        case 7:
            return dayjs.utc(newDate).subtract(48, 'hours').startOf('day').toDate();
        default:
            return dato;
    }
}
/**
 * Første gyldige uttaksdag etter dato
 * @param termin
 */
function getUttaksdagEtterDato(dato: Date): Date {
    return getUttaksdagFraOgMedDato(dayjs.utc(dato).add(24, 'hours').toDate());
}

/**
 * Sjekker om dato er en ukedag, dersom ikke finner den nærmeste påfølgende mandag
 * Tar hensyn til stilling av klokken ved å gjøre om klokka til kl 12 før antall timer legges til.
 * @param dato
 */
function getUttaksdagFraOgMedDato(dato: Date): Date {
    const newDate = dato ? new Date(dato.getFullYear(), dato.getMonth(), dato.getDate(), 12) : dato;
    switch (getUkedag(dato)) {
        case 6:
            return dayjs.utc(newDate).add(48, 'hours').startOf('day').toDate();
        case 7:
            return dayjs.utc(newDate).add(24, 'hours').startOf('day').toDate();
        default:
            return dato;
    }
}

/**
 * Legger uttaksdager til en dato og returnerer ny dato
 * @param dato
 * @param uttaksdager
 */
function leggUttaksdagerTilDato(dato: Date, uttaksdager: number): Date {
    if (erUttaksdag(dato) === false) {
        throw new Error(`leggUttaksdagerTilDato: Dato ${formatDate(dato)} må være uttaksdag`);
    }
    let nyDato = dato;
    let dagteller = 0;
    let uttaksdageteller = 0;
    while (uttaksdageteller <= uttaksdager) {
        const tellerdato = dayjs
            .utc(dato)
            .add(dagteller++ * 24, 'hours')
            .toDate();
        if (erUttaksdag(tellerdato)) {
            nyDato = tellerdato;
            uttaksdageteller++;
        }
    }
    return nyDato;
}

/**
 * Trekker uttaksdager fra en dato og returnerer ny dato
 * @param dato
 * @param uttaksdager
 */
function trekkUttaksdagerFraDato(dato: Date, uttaksdager: number): Date {
    if (erUttaksdag(dato) === false) {
        throw new Error(`trekkUttaksdagerFraDato: Dato ${formatDate(dato)} må være uttaksdag`);
    }
    let nyDato = dato;
    let dagteller = 0;
    let uttaksdageteller = 0;
    while (uttaksdageteller < Math.abs(uttaksdager)) {
        const tellerdato = dayjs
            .utc(dato)
            .add(--dagteller * 24, 'hours')
            .toDate();
        if (erUttaksdag(tellerdato)) {
            nyDato = tellerdato;
            uttaksdageteller++;
        }
    }
    return nyDato;
}

/**
 * Finner antall uttaksdager som er mellom to datoer. Dvs. fra og med startdato, og
 * frem til sluttdato (ikke til og med)
 * @param fra
 * @param til
 */
function getUttaksdagerFremTilDato(fom: Date, tom: Date): number {
    if (dayjs(fom).isSame(tom, 'day')) {
        return 0;
    }
    if (dayjs(fom).isBefore(tom, 'day')) {
        return Tidsperioden({ fom, tom }).getAntallUttaksdager() - 1;
    }
    return (
        -1 *
        (Tidsperioden({
            fom: tom,
            tom: fom,
        }).getAntallUttaksdager() -
            1)
    );
}
