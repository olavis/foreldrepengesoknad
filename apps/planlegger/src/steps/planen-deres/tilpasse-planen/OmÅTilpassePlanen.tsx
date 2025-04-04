import { PencilWritingIcon } from '@navikt/aksel-icons';
import { FormattedMessage } from 'react-intl';
import { Arbeidssituasjon } from 'types/Arbeidssituasjon';
import { OmBarnet } from 'types/Barnet';
import { HvemPlanlegger } from 'types/HvemPlanlegger';
import { erAlenesøker, erFarOgFar } from 'utils/HvemPlanleggerUtils';
import { loggExpansionCardOpen } from 'utils/amplitudeUtils';
import { erBarnetAdoptert } from 'utils/barnetUtils';
import { utledHvemSomHarRett } from 'utils/hvemHarRettUtils';

import { BodyLong, ExpansionCard, HStack, VStack } from '@navikt/ds-react';

import { HvemPlanleggerType } from '@navikt/fp-types';
import { IconCircleWrapper } from '@navikt/fp-ui';

import { Barnehageplass } from './Barnehageplass';
import { DeFørsteSeksUkene } from './DeFørsteSeksUkene';
import { FørTermin } from './FørTermin';
import { JobbeSamtidig } from './JobbeSamtidig';
import { LeggeTilFerie } from './LeggeTilFerie';
import { PermisjonSamtidig } from './PermisjonSamtidig';
import { ToUkerRundtFødsel } from './ToUkerRundtFødsel';

interface Props {
    hvemPlanlegger: HvemPlanlegger;
    arbeidssituasjon: Arbeidssituasjon;
    barnet: OmBarnet;
}
export const OmÅTilpassePlanen = ({ hvemPlanlegger, arbeidssituasjon, barnet }: Props) => {
    const erAlene = erAlenesøker(hvemPlanlegger);
    const erFedre = erFarOgFar(hvemPlanlegger);

    const hvemHarRett = utledHvemSomHarRett(arbeidssituasjon);
    const kunEnPartSkalHa = hvemHarRett !== 'beggeHarRett';
    const kunFarSøker2EllerMedmorHarRett =
        hvemHarRett === 'kunSøker2HarRett' &&
        (hvemPlanlegger.type === HvemPlanleggerType.MOR_OG_MEDMOR ||
            hvemPlanlegger.type === HvemPlanleggerType.MOR_OG_FAR);
    const søker1HarRett = hvemHarRett === 'beggeHarRett' || hvemHarRett === 'kunSøker1HarRett';

    return (
        <ExpansionCard
            aria-label="Expansion card"
            onToggle={loggExpansionCardOpen('toggle-tilpasse-planen')}
            size="small"
        >
            <ExpansionCard.Header>
                <HStack gap="6" align="center" wrap={false}>
                    <div>
                        <IconCircleWrapper color="lightBlue" size="medium">
                            <PencilWritingIcon height={24} width={24} fontSize="1.5rem" aria-hidden />
                        </IconCircleWrapper>
                    </div>
                    <div>
                        <ExpansionCard.Title size="small">
                            <FormattedMessage id="OmÅTilpassePlanen.Oversikt.OmÅTilpassePlanen" />
                        </ExpansionCard.Title>
                    </div>
                </HStack>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <VStack gap="5">
                    <BodyLong>
                        <FormattedMessage id="OmÅTilpassePlanen.Tekst" />
                    </BodyLong>
                    {!erBarnetAdoptert(barnet) && (
                        <>
                            {søker1HarRett && !erFedre && hvemPlanlegger.type !== HvemPlanleggerType.FAR && (
                                <FørTermin hvemPlanlegger={hvemPlanlegger} barnet={barnet} />
                            )}

                            {søker1HarRett && !erFedre && !erAlene && (
                                <DeFørsteSeksUkene
                                    hvemPlanlegger={hvemPlanlegger}
                                    arbeidssituasjon={arbeidssituasjon}
                                />
                            )}
                            <Barnehageplass />

                            {kunFarSøker2EllerMedmorHarRett && <ToUkerRundtFødsel hvemPlanlegger={hvemPlanlegger} />}

                            <LeggeTilFerie hvemPlanlegger={hvemPlanlegger} arbeidssituasjon={arbeidssituasjon} />

                            {<JobbeSamtidig />}

                            {(!erAlene || !erFedre) && !kunEnPartSkalHa && <PermisjonSamtidig />}
                        </>
                    )}
                    {erBarnetAdoptert(barnet) && (
                        <>
                            <Barnehageplass />

                            <LeggeTilFerie hvemPlanlegger={hvemPlanlegger} arbeidssituasjon={arbeidssituasjon} />

                            <JobbeSamtidig />

                            {(!erAlene || !erFedre) && !kunEnPartSkalHa && <PermisjonSamtidig erAdopsjon />}
                        </>
                    )}
                </VStack>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
