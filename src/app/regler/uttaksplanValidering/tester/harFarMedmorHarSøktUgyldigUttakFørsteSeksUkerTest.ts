import { Regel, Regelgrunnlag, RegelTest } from '../types';
import { regelHarAvvik, regelPasserer } from '../regelUtils';
import { harFarHarSøktUgyldigUttakFørsteSeksUker } from '../../../util/validation/uttaksplan/uttakFarValidation';

export const harFarMedmorSøktUgyldigUttakFørsteSeksUkerTest: RegelTest = (regel: Regel, grunnlag: Regelgrunnlag) => {
    const {
        søknadsinfo: { søker, søknaden },
        perioder
    } = grunnlag;

    if (søker.erFarEllerMedmor && søknaden.erDeltUttak) {
        return harFarHarSøktUgyldigUttakFørsteSeksUker(
            perioder,
            søknaden.familiehendelsesdato,
            søknaden.antallBarn,
            søknaden.situasjon
        )
            ? regelHarAvvik(regel)
            : regelPasserer(regel);
    }

    return regelPasserer(regel);
};
