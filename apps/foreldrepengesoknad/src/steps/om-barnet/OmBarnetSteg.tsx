import { useQuery } from '@tanstack/react-query';
import { useAnnenPartVedtakOptions } from 'api/queries';
import { ContextDataType, useContextGetData, useContextSaveData } from 'appData/FpDataContext';
import { useFpNavigator } from 'appData/useFpNavigator';
import { useStepConfig } from 'appData/useStepConfig';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { getFamiliehendelsedato } from 'utils/barnUtils';
import {
    andreAugust2022ReglerGjelder,
    getEldsteRegistrerteBarn,
    getErDatoInnenEnDagFraAnnenDato,
} from 'utils/dateUtils';
import { isFarEllerMedmor } from 'utils/isFarEllerMedmor';

import { Loader, VStack } from '@navikt/ds-react';

import { Barn, Situasjon, Søkerrolle, isFødtBarn, isUfødtBarn } from '@navikt/fp-common';
import { ErrorSummaryHookForm, RhfForm, StepButtonsHookForm } from '@navikt/fp-form-hooks';
import { BarnFrontend, Søkerinfo } from '@navikt/fp-types';
import { SkjemaRotLayout, Step } from '@navikt/fp-ui';
import { notEmpty } from '@navikt/fp-validation';

import { BarnetFormValues } from './OmBarnetFormValues';
import { ValgteRegistrerteBarn } from './ValgteRegistrerteBarn';
import { AdopsjonPanel } from './adopsjon/AdopsjonPanel';
import { FødselPanel } from './fødsel/FødselPanel';
import { getOmBarnetInitialValues, mapOmBarnetFormDataToState } from './omBarnetContextFormMapping';

const erDatoInnenforDeSiste12Ukene = (dato: string | Date) => {
    const twelveWeeksAfterBirthday = dayjs(dato).add(12, 'weeks');
    return dayjs(twelveWeeksAfterBirthday).isAfter(new Date(), 'day');
};

const findBarnetIRegistrerteBarn = (regBarn: BarnFrontend, barnet: Barn) => {
    if (barnet && !isUfødtBarn(barnet) && barnet.fnr !== undefined && barnet.fnr.length > 0) {
        return barnet.fnr.includes(regBarn.fnr);
    }
    return false;
};

const skalViseTermindato = (
    rolle: Søkerrolle,
    fødselsdato: string | undefined,
    valgteRegistrerteBarn: BarnFrontend[] | undefined,
    situasjon: Situasjon,
): boolean => {
    if (situasjon === 'adopsjon') {
        return false;
    }

    let eldsteBarnFødselsdato = undefined;

    if (valgteRegistrerteBarn !== undefined && valgteRegistrerteBarn.length > 0) {
        const eldsteBarn = getEldsteRegistrerteBarn(valgteRegistrerteBarn);

        eldsteBarnFødselsdato = eldsteBarn.fødselsdato;
    }

    if (!fødselsdato && !eldsteBarnFødselsdato) {
        return false;
    }

    const relevantFødselsdato = eldsteBarnFødselsdato ?? fødselsdato;

    if (isFarEllerMedmor(rolle)) {
        if (andreAugust2022ReglerGjelder(relevantFødselsdato!)) {
            return true;
        }
        return erDatoInnenforDeSiste12Ukene(relevantFødselsdato!);
    }
    return true;
};

type Props = {
    søkerInfo: Søkerinfo;
    søknadGjelderNyttBarn: boolean;
    mellomlagreSøknadOgNaviger: () => Promise<void>;
    avbrytSøknad: () => void;
};

export const OmBarnetSteg = (props: Props) => {
    const annenPartVedtakOptions = useAnnenPartVedtakOptions();
    const terminDatoQuery = useQuery({
        ...annenPartVedtakOptions,
        select: (vedtak) => vedtak?.termindato,
    });

    if (terminDatoQuery.isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '12rem 0' }}>
                <Loader size="2xlarge" />
            </div>
        );
    }

    return <OmBarnetStegInner {...props} termindato={terminDatoQuery.data} />;
};

const OmBarnetStegInner = ({
    søkerInfo,
    søknadGjelderNyttBarn,
    mellomlagreSøknadOgNaviger,
    avbrytSøknad,
    termindato,
}: Props & { termindato?: string }) => {
    const intl = useIntl();

    const stepConfig = useStepConfig(søkerInfo.arbeidsforhold);
    const navigator = useFpNavigator(søkerInfo.arbeidsforhold, mellomlagreSøknadOgNaviger);

    const søkersituasjon = notEmpty(useContextGetData(ContextDataType.SØKERSITUASJON));
    const omBarnet = useContextGetData(ContextDataType.OM_BARNET);

    const oppdaterOmBarnet = useContextSaveData(ContextDataType.OM_BARNET);

    const { arbeidsforhold, søker } = søkerInfo;

    const erFarEllerMedmor = isFarEllerMedmor(søkersituasjon.rolle);
    const familiehendelsesdato = omBarnet ? getFamiliehendelsedato(omBarnet) : undefined;

    const dødfødteUtenFnrMedSammeFødselsdato =
        omBarnet && isFødtBarn(omBarnet)
            ? søker.barn.filter(
                  (barn) =>
                      barn.fnr === undefined && getErDatoInnenEnDagFraAnnenDato(barn.fødselsdato, familiehendelsesdato),
              )
            : [];

    const valgteRegistrerteBarn =
        !søknadGjelderNyttBarn && omBarnet && !isUfødtBarn(omBarnet)
            ? søker.barn
                  .filter((b) => findBarnetIRegistrerteBarn(b, omBarnet))
                  .concat(dødfødteUtenFnrMedSammeFødselsdato)
            : undefined;

    const barnSøktOmFørMenIkkeRegistrert =
        !søknadGjelderNyttBarn && (valgteRegistrerteBarn === undefined || valgteRegistrerteBarn.length === 0);

    const onSubmit = (values: BarnetFormValues) => {
        const valgtBarn = !søknadGjelderNyttBarn && !barnSøktOmFørMenIkkeRegistrert ? omBarnet : undefined;

        const oppdatertBarn = mapOmBarnetFormDataToState(
            values,
            arbeidsforhold,
            søkersituasjon,
            valgtBarn,
            søkersituasjon.situasjon,
            barnSøktOmFørMenIkkeRegistrert,
        );

        oppdaterOmBarnet(oppdatertBarn);

        return navigator.goToNextDefaultStep();
    };

    const defaultValues = useMemo(
        () => getOmBarnetInitialValues(arbeidsforhold, søkersituasjon, omBarnet, termindato),
        [arbeidsforhold, omBarnet, termindato],
    );
    const formMethods = useForm<BarnetFormValues>({
        shouldUnregister: true,
        defaultValues,
    });

    const fødselsdatoer = formMethods.watch('fødselsdatoer');
    const skalInkludereTermindato = skalViseTermindato(
        søkersituasjon.rolle,
        fødselsdatoer ? fødselsdatoer[0].dato : undefined,
        valgteRegistrerteBarn,
        søkersituasjon.situasjon,
    );

    return (
        <SkjemaRotLayout pageTitle={intl.formatMessage({ id: 'søknad.pageheading' })}>
            <Step steps={stepConfig}>
                <RhfForm formMethods={formMethods} onSubmit={onSubmit}>
                    <VStack gap="10">
                        <ErrorSummaryHookForm />
                        {valgteRegistrerteBarn && valgteRegistrerteBarn.length > 0 && (
                            <ValgteRegistrerteBarn
                                valgteRegistrerteBarn={valgteRegistrerteBarn}
                                skalInkludereTermindato={skalInkludereTermindato}
                            />
                        )}
                        {søkersituasjon.situasjon === 'fødsel' && (
                            <FødselPanel
                                erFarEllerMedmor={erFarEllerMedmor}
                                søknadGjelderEtNyttBarn={barnSøktOmFørMenIkkeRegistrert || søknadGjelderNyttBarn}
                                søkersituasjon={søkersituasjon}
                                arbeidsforhold={arbeidsforhold}
                            />
                        )}
                        {søkersituasjon.situasjon === 'adopsjon' && (
                            <AdopsjonPanel
                                søknadGjelderEtNyttBarn={barnSøktOmFørMenIkkeRegistrert || søknadGjelderNyttBarn}
                            />
                        )}
                        <StepButtonsHookForm
                            goToPreviousStep={navigator.goToPreviousDefaultStep}
                            onAvsluttOgSlett={avbrytSøknad}
                            onFortsettSenere={navigator.fortsettSøknadSenere}
                        />
                    </VStack>
                </RhfForm>
            </Step>
        </SkjemaRotLayout>
    );
};
