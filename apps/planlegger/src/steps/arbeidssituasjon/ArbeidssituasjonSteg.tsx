import { ContextDataType, useContextGetData, useContextSaveData } from 'appData/PlanleggerDataContext';
import { PlanleggerRoutes } from 'appData/routes';
import { usePlanleggerNavigator } from 'appData/usePlanleggerNavigator';
import { useStepData } from 'appData/useStepData';
import { BlueRadioGroup } from 'components/form-wrappers/BlueRadioGroup';
import { PlanleggerStepPage } from 'components/page/PlanleggerStepPage';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Arbeidssituasjon, Arbeidsstatus } from 'types/Arbeidssituasjon';
import { erAlenesøker as erAlene, getFornavnPåSøker1, getFornavnPåSøker2 } from 'utils/HvemPlanleggerUtils';
import { finnSisteGrunnbeløp } from 'utils/satserUtils';

import { Heading, Radio, Spacer, VStack } from '@navikt/ds-react';

import { RhfForm, StepButtonsHookForm } from '@navikt/fp-form-hooks';
import { HvemPlanleggerType, Satser } from '@navikt/fp-types';
import { formatCurrencyWithKr } from '@navikt/fp-utils';
import { useScrollBehaviour } from '@navikt/fp-utils/src/hooks/useScrollBehaviour';
import { isRequired, notEmpty } from '@navikt/fp-validation';

import { AnnetInfoboks } from './info/AnnetInfoboks';
import { JobberInfoboks } from './info/JobberInfoboks';
import { UførInfoboks } from './info/UførInfoboks';

interface Props {
    satser: Satser;
}

export const ArbeidssituasjonSteg = ({ satser }: Props) => {
    const intl = useIntl();
    const navigator = usePlanleggerNavigator();
    const stepConfig = useStepData();

    const arbeidssituasjon = useContextGetData(ContextDataType.ARBEIDSSITUASJON);
    const hvemPlanlegger = notEmpty(useContextGetData(ContextDataType.HVEM_PLANLEGGER));

    const oppdaterArbeidssituasjon = useContextSaveData(ContextDataType.ARBEIDSSITUASJON);
    const oppdaterFordeling = useContextSaveData(ContextDataType.FORDELING);
    const oppdaterHvorLangPeriode = useContextSaveData(ContextDataType.HVOR_LANG_PERIODE);
    const oppdaterHvorMye = useContextSaveData(ContextDataType.HVOR_MYE);

    const formMethods = useForm<Arbeidssituasjon>({
        defaultValues: arbeidssituasjon,
        shouldUnregister: true,
    });

    const status = formMethods.watch('status');
    const jobberSøker2 = formMethods.watch('jobberAnnenPart');

    const erAlenesøker = erAlene(hvemPlanlegger);
    const fornavnSøker1 = getFornavnPåSøker1(hvemPlanlegger, intl);
    const fornavnSøker2 = getFornavnPåSøker2(hvemPlanlegger, intl);

    const onSubmit = (formValues: Arbeidssituasjon) => {
        oppdaterArbeidssituasjon(formValues);

        const minstEnJobber = formValues.status === Arbeidsstatus.JOBBER || formValues.jobberAnnenPart;

        if (minstEnJobber) {
            navigator.goToNextStep(PlanleggerRoutes.HVOR_MYE);
        } else {
            oppdaterHvorMye(undefined);
            oppdaterFordeling(undefined);
            oppdaterHvorLangPeriode(undefined);
            navigator.goToNextStep(PlanleggerRoutes.OPPSUMMERING);
        }
    };

    const erFarOgFar = hvemPlanlegger.type === HvemPlanleggerType.FAR_OG_FAR;

    const { ref, scrollToBottom } = useScrollBehaviour();

    const minsteInntekt = formatCurrencyWithKr(finnSisteGrunnbeløp(satser) / 2);

    return (
        <PlanleggerStepPage ref={ref} steps={stepConfig} goToStep={navigator.goToNextStep}>
            <RhfForm formMethods={formMethods} onSubmit={onSubmit} shouldUseFlexbox>
                <VStack gap="10" style={{ flex: 1 }}>
                    <VStack gap="8">
                        <Heading level="2" size="medium">
                            <FormattedMessage id="ArbeidssituasjonSteg.Tittel" />
                        </Heading>
                        {(erAlenesøker || erFarOgFar) && (
                            <BlueRadioGroup
                                name="status"
                                control={formMethods.control}
                                label={
                                    <FormattedMessage
                                        id="Arbeidssituasjon.Forelder"
                                        values={{ fornavnSøker1, minsteInntekt }}
                                    />
                                }
                                validate={[
                                    isRequired(
                                        intl.formatMessage(
                                            {
                                                id: 'Arbeidssituasjon.Forelder.Required',
                                            },
                                            { minsteInntekt },
                                        ),
                                    ),
                                ]}
                                onChange={scrollToBottom}
                            >
                                <Radio value={Arbeidsstatus.JOBBER} autoFocus>
                                    <FormattedMessage id="DefaultMessage.Ja" />
                                </Radio>
                                <Radio value={Arbeidsstatus.INGEN}>
                                    <FormattedMessage id="DefaultMessage.Nei" />
                                </Radio>
                            </BlueRadioGroup>
                        )}
                        {!erAlenesøker && !erFarOgFar && (
                            <BlueRadioGroup
                                name="status"
                                control={formMethods.control}
                                label={
                                    <FormattedMessage
                                        id="ArbeidssituasjonSteg.HvaGjelder"
                                        values={{ erAlenesøker, navn: fornavnSøker1 }}
                                    />
                                }
                                validate={[
                                    isRequired(
                                        intl.formatMessage(
                                            {
                                                id: 'ArbeidssituasjonSteg.HvaGjelder.Required',
                                            },
                                            { erAlenesøker, navn: fornavnSøker1 },
                                        ),
                                    ),
                                ]}
                                onChange={scrollToBottom}
                            >
                                <Radio value={Arbeidsstatus.JOBBER}>
                                    <FormattedMessage
                                        id="ArbeidssituasjonSteg.Jobber"
                                        values={{
                                            minsteInntekt,
                                        }}
                                    />
                                </Radio>
                                <Radio value={Arbeidsstatus.UFØR}>
                                    <FormattedMessage id="ArbeidssituasjonSteg.Ufør" />
                                </Radio>
                                <Radio value={Arbeidsstatus.INGEN}>
                                    <FormattedMessage id="ArbeidssituasjonSteg.Ingen" />
                                </Radio>
                            </BlueRadioGroup>
                        )}
                        {status === Arbeidsstatus.JOBBER && (
                            <JobberInfoboks erAlenesøker={erAlenesøker} fornavn={fornavnSøker1} />
                        )}
                        {status === Arbeidsstatus.UFØR && (
                            <UførInfoboks erAlenesøker={erAlenesøker} fornavn={fornavnSøker1} />
                        )}
                        {status === Arbeidsstatus.INGEN && (
                            <AnnetInfoboks
                                erAlenesøker={erAlenesøker}
                                fornavn={fornavnSøker1}
                                erFarOgFar={erFarOgFar}
                                satser={satser}
                            />
                        )}
                        {!erAlenesøker && status && (
                            <>
                                <BlueRadioGroup
                                    name="jobberAnnenPart"
                                    control={formMethods.control}
                                    label={
                                        <FormattedMessage
                                            id="Arbeidssituasjon.AndreForelder"
                                            values={{
                                                navn: fornavnSøker2,
                                                minsteInntekt,
                                            }}
                                        />
                                    }
                                    validate={[
                                        isRequired(
                                            intl.formatMessage(
                                                { id: 'Arbeidssituasjon.AndreForelder.Required' },
                                                {
                                                    navn: fornavnSøker2,
                                                    minsteInntekt,
                                                },
                                            ),
                                        ),
                                    ]}
                                    shouldFadeIn
                                    shouldAutofocus
                                    onChange={scrollToBottom}
                                >
                                    <Radio value={true}>
                                        <FormattedMessage id="DefaultMessage.Ja" />
                                    </Radio>
                                    <Radio value={false}>
                                        <FormattedMessage id="DefaultMessage.Nei" />
                                    </Radio>
                                </BlueRadioGroup>
                                {jobberSøker2 === true && fornavnSøker2 && (
                                    <JobberInfoboks erAlenesøker={erAlenesøker} fornavn={fornavnSøker2} />
                                )}
                                {jobberSøker2 === false && fornavnSøker2 && (
                                    <AnnetInfoboks
                                        erAlenesøker={erAlenesøker}
                                        fornavn={fornavnSøker2}
                                        erSøker2
                                        erFarOgFar={erFarOgFar}
                                        satser={satser}
                                    />
                                )}
                            </>
                        )}
                    </VStack>
                    <Spacer />
                    <StepButtonsHookForm
                        saveDataOnPreviousClick={oppdaterArbeidssituasjon}
                        goToPreviousStep={navigator.goToPreviousDefaultStep}
                        useSimplifiedTexts
                    />
                </VStack>
            </RhfForm>
        </PlanleggerStepPage>
    );
};
