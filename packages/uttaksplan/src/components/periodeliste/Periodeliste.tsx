import dayjs from 'dayjs';
import { FunctionComponent, useState } from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';

import { Alert } from '@navikt/ds-react';

import {
    AnnenForelder,
    Arbeidsforhold,
    Barn,
    BarnFraNesteSak,
    NavnPåForeldre,
    Periode,
    PeriodeValidState,
    Situasjon,
    Utsettelsesperiode,
    isInfoPeriode,
} from '@navikt/fp-common';
import { loggAmplitudeEvent } from '@navikt/fp-metrics';
import { TilgjengeligeStønadskontoerForDekningsgrad } from '@navikt/fp-types';
import { formatDate, formatDateIso, isValidTidsperiodeString } from '@navikt/fp-utils';

import Block from '../../common/block/Block';
import { getAnnenForelderSamtidigUttakPeriode } from '../../utils/periodeUtils';
import planBemUtils from '../../utils/planBemUtils';
import { VeiledermeldingerPerPeriode } from '../../validering/veilederInfo/types';
import FamiliehendelsedatoDisplay from '../familiehendelsedato-display/FamiliehendelsedatoDisplay';
import PeriodelisteItem from './../periodeliste-item/PeriodelisteItem';
import './periodeliste.less';

interface Props {
    uttaksplan: Periode[];
    familiehendelsesdato: Date;
    handleUpdatePeriode: (periode: Periode, familiehendelsedato: Date) => void;
    stønadskontoer: TilgjengeligeStønadskontoerForDekningsgrad;
    navnPåForeldre: NavnPåForeldre;
    annenForelder: AnnenForelder;
    arbeidsforhold: Arbeidsforhold[];
    handleDeletePeriode: (periodeId: string) => void;
    erFarEllerMedmor: boolean;
    erFlerbarnssøknad: boolean;
    erAleneOmOmsorg: boolean;
    erDeltUttak: boolean;
    situasjon: Situasjon;
    meldingerPerPeriode: VeiledermeldingerPerPeriode;
    erMorUfør: boolean;
    søkerErFarEllerMedmorOgKunDeHarRett: boolean;
    setPerioderErGyldige: React.Dispatch<React.SetStateAction<PeriodeValidState[]>>;
    erEndringssøknad: boolean;
    termindato: Date | undefined;
    antallBarn: number;
    utsettelserIPlan: Utsettelsesperiode[];
    barn: Barn;
    barnFraNesteSak: BarnFraNesteSak | undefined;
    intl: IntlShape;
    perioderErGyldige: PeriodeValidState[];
}

const getIndexOfFørstePeriodeEtterFødsel = (uttaksplan: Periode[], familiehendelsesdato: Date) => {
    return uttaksplan.findIndex(
        (p) =>
            isValidTidsperiodeString(p.tidsperiode) &&
            dayjs(p.tidsperiode.fom).isSameOrAfter(familiehendelsesdato, 'd'),
    );
};

export const getIndexOfSistePeriodeFørDato = (uttaksplan: Periode[], dato: string | undefined) => {
    if (dato !== undefined) {
        return Math.max(0, uttaksplan.filter((p) => dayjs(p.tidsperiode.tom).isBefore(dato, 'day')).length);
    }
    return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-restricted-types
const Periodeliste: FunctionComponent<Props> = ({
    uttaksplan,
    familiehendelsesdato,
    handleUpdatePeriode,
    stønadskontoer,
    navnPåForeldre,
    annenForelder,
    arbeidsforhold,
    handleDeletePeriode,
    erFarEllerMedmor,
    erFlerbarnssøknad,
    erAleneOmOmsorg,
    erDeltUttak,
    situasjon,
    meldingerPerPeriode,
    erMorUfør,
    søkerErFarEllerMedmorOgKunDeHarRett,
    setPerioderErGyldige,
    erEndringssøknad,
    termindato,
    antallBarn,
    utsettelserIPlan,
    barn,
    barnFraNesteSak,
    intl,
    perioderErGyldige,
}) => {
    const [openPeriodeId, setOpenPeriodeId] = useState<string>(null!);
    const bem = planBemUtils('periodeliste');

    const toggleIsOpen = (id: string) => {
        if (openPeriodeId === id) {
            setOpenPeriodeId(null!);
        } else {
            loggAmplitudeEvent({
                origin: 'foreldrepengesoknad',
                eventName: 'accordion åpnet',
                eventData: { tittel: 'expandPeriode' },
            });
            setOpenPeriodeId(id);
        }
    };

    const indexOfFørstePeriodeEtterFødsel = getIndexOfFørstePeriodeEtterFødsel(uttaksplan, familiehendelsesdato);
    const erAllePerioderIPlanenFørFødsel = indexOfFørstePeriodeEtterFødsel === -1;
    const indexOfSistePeriodeFørNyStøndasperiodeNyttBarn =
        barnFraNesteSak !== undefined
            ? getIndexOfSistePeriodeFørDato(uttaksplan, formatDateIso(barnFraNesteSak.startdatoFørsteStønadsperiode))
            : undefined;
    return (
        <div className={bem.block}>
            {uttaksplan.map((p, index) => {
                const periodeMedValidState = perioderErGyldige.find((periodeMedState) => periodeMedState.id === p.id);
                const periodeErGyldig = periodeMedValidState ? periodeMedValidState.isValid : true;
                return (
                    <div key={p.id}>
                        {indexOfFørstePeriodeEtterFødsel === index ? <FamiliehendelsedatoDisplay barn={barn} /> : null}
                        {barnFraNesteSak !== undefined &&
                        indexOfSistePeriodeFørNyStøndasperiodeNyttBarn !== undefined &&
                        indexOfSistePeriodeFørNyStøndasperiodeNyttBarn === index ? (
                            <Block padBottom="s">
                                <Alert className="nyStønadsperiodeNesteSak" variant="info">
                                    <FormattedMessage
                                        id="uttaksplan.periodeliste.info.nyStønadsperiodeNesteSak"
                                        values={{
                                            datoStønadsperiodeNyttBarn: formatDate(
                                                barnFraNesteSak.startdatoFørsteStønadsperiode,
                                            ),
                                        }}
                                    />
                                </Alert>
                            </Block>
                        ) : null}
                        <PeriodelisteItem
                            key={p.id}
                            egenPeriode={!isInfoPeriode(p)}
                            periode={p}
                            isOpen={openPeriodeId === p.id}
                            toggleIsOpen={toggleIsOpen}
                            familiehendelsesdato={familiehendelsesdato}
                            handleUpdatePeriode={handleUpdatePeriode}
                            stønadskontoer={stønadskontoer}
                            navnPåForeldre={navnPåForeldre}
                            annenForelder={annenForelder}
                            arbeidsforhold={arbeidsforhold}
                            handleDeletePeriode={handleDeletePeriode}
                            erFarEllerMedmor={erFarEllerMedmor}
                            erFlerbarnssøknad={erFlerbarnssøknad}
                            erAleneOmOmsorg={erAleneOmOmsorg}
                            erDeltUttak={erDeltUttak}
                            situasjon={situasjon}
                            meldinger={meldingerPerPeriode[p.id]}
                            erMorUfør={erMorUfør}
                            annenForelderSamtidigUttakPeriode={getAnnenForelderSamtidigUttakPeriode(p, uttaksplan)}
                            søkerErFarEllerMedmorOgKunDeHarRett={søkerErFarEllerMedmorOgKunDeHarRett}
                            setPerioderErGyldige={setPerioderErGyldige}
                            erEndringssøknad={erEndringssøknad}
                            termindato={termindato}
                            antallBarn={antallBarn}
                            utsettelserIPlan={utsettelserIPlan}
                            intl={intl}
                            periodeErGyldig={periodeErGyldig}
                        />
                        {erAllePerioderIPlanenFørFødsel && index === uttaksplan.length - 1 ? (
                            <FamiliehendelsedatoDisplay barn={barn} />
                        ) : null}
                        {barnFraNesteSak !== undefined &&
                        index === uttaksplan.length - 1 &&
                        indexOfSistePeriodeFørNyStøndasperiodeNyttBarn === uttaksplan.length ? (
                            <Block padBottom="s">
                                <Alert className="nyStønadsperiodeNesteSak" variant="info">
                                    <FormattedMessage
                                        id="uttaksplan.periodeliste.info.nyStønadsperiodeNesteSak"
                                        values={{
                                            datoStønadsperiodeNyttBarn: formatDate(
                                                barnFraNesteSak.startdatoFørsteStønadsperiode,
                                            ),
                                        }}
                                    />
                                </Alert>
                            </Block>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
// eslint-disable-next-line import/no-default-export
export default Periodeliste;
