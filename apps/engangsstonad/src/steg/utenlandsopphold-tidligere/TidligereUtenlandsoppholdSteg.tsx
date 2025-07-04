import { ContextDataType, useContextGetData, useContextSaveData } from 'appData/EsDataContext';
import { Path } from 'appData/paths';
import { useEsNavigator } from 'appData/useEsNavigator';
import { useStepConfig } from 'appData/useStepConfig';
import { FormattedMessage } from 'react-intl';

import { TidligereUtenlandsoppholdPanel } from '@navikt/fp-steg-utenlandsopphold';
import { UtenlandsoppholdPeriode } from '@navikt/fp-types';
import { SkjemaRotLayout } from '@navikt/fp-ui';
import { notEmpty } from '@navikt/fp-validation';

type Props = {
    mellomlagreOgNaviger: () => Promise<void>;
};

export const TidligereUtenlandsoppholdSteg = ({ mellomlagreOgNaviger }: Props) => {
    const stepConfig = useStepConfig();
    const navigator = useEsNavigator(mellomlagreOgNaviger);

    const utenlandsopphold = notEmpty(useContextGetData(ContextDataType.UTENLANDSOPPHOLD));
    const tidligereUtenlandsopphold = useContextGetData(ContextDataType.UTENLANDSOPPHOLD_TIDLIGERE);
    const oppdaterTidligereUtenlandsopphold = useContextSaveData(ContextDataType.UTENLANDSOPPHOLD_TIDLIGERE);

    const lagre = (formValues: UtenlandsoppholdPeriode[]) => {
        oppdaterTidligereUtenlandsopphold(formValues);
        return navigator.goToNextStep(
            utenlandsopphold.skalBoUtenforNorgeNeste12Mnd ? Path.SENERE_UTENLANDSOPPHOLD : Path.OPPSUMMERING,
        );
    };

    return (
        <SkjemaRotLayout pageTitle={<FormattedMessage id="Søknad.Pageheading" />}>
            <TidligereUtenlandsoppholdPanel
                tidligereUtenlandsopphold={tidligereUtenlandsopphold ?? []}
                saveOnNext={lagre}
                saveOnPrevious={oppdaterTidligereUtenlandsopphold}
                onFortsettSenere={navigator.fortsettSøknadSenere}
                onStepChange={navigator.goToNextStep}
                onAvsluttOgSlett={navigator.avbrytSøknad}
                goToPreviousStep={navigator.goToPreviousDefaultStep}
                stepConfig={stepConfig}
            />
        </SkjemaRotLayout>
    );
};
