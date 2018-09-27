import * as React from 'react';
import {
    UtsettelseÅrsakType,
    Utsettelsesårsaker,
    UtsettelseÅrsakSykdomType
} from '../../types/uttaksplan/periodetyper';
import UttaksplanIkon, { UttaksplanIkonKeys } from './UttaksplanIkon';
import { getUtsettelseFarge } from '../../util/uttaksplan/styleUtils';
import IconBox from '../icon-box/IconBox';

export interface Props {
    årsak: Utsettelsesårsaker;
    gradert?: boolean;
}

const getIkonForKonto = (årsak: Utsettelsesårsaker): UttaksplanIkonKeys => {
    switch (årsak) {
        case UtsettelseÅrsakType.Ferie:
            return UttaksplanIkonKeys.ferie;
        case UtsettelseÅrsakType.Arbeid:
            return UttaksplanIkonKeys.arbeid;
        case UtsettelseÅrsakSykdomType.InstitusjonBarnet:
        case UtsettelseÅrsakSykdomType.InstitusjonSøker:
        case UtsettelseÅrsakSykdomType.Sykdom:
            return UttaksplanIkonKeys.sykdom;
    }
};

const UtsettelseIkon: React.StatelessComponent<Props> = ({ årsak, gradert }) => (
    <IconBox color={getUtsettelseFarge()} stripes={gradert}>
        <UttaksplanIkon ikon={getIkonForKonto(årsak)} />
    </IconBox>
);

export default UtsettelseIkon;
