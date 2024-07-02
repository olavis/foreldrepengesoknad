import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { Satser } from '@navikt/fp-types';
import { notEmpty } from '@navikt/fp-validation';

dayjs.extend(isSameOrAfter);

export const finnGrunnbeløp = (satser: Satser, dato: string | Dayjs) =>
    notEmpty(satser.grunnbeløp.find((grunnbeløpData) => dayjs(dato).isSameOrAfter(grunnbeløpData.fom))).verdi;

export const finnEngangsstønad = (satser: Satser, dato: string | Dayjs) =>
    notEmpty(satser.engangstønad.find((engangsstønadData) => dayjs(dato).isSameOrAfter(engangsstønadData.fom))).verdi;
