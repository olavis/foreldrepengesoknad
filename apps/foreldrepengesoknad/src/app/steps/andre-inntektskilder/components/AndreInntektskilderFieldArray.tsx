import { PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, HStack, Radio, VStack } from '@navikt/ds-react';

import { RadioGroup } from '@navikt/fp-form-hooks';
import { HorizontalLine } from '@navikt/fp-ui';
import { isRequired } from '@navikt/fp-validation';

import { AndreInntektskilder, AnnenInntektType } from 'app/types/AndreInntektskilder';

import { EtterlønnEllerSluttvederlagPanel } from './EtterlønnEllerSluttvederlagPanel';
import { FørstegangstjenestePanel } from './FørstegangstjenestePanel';
import { JobbIUtlandetPanel } from './JobbIUtlandetPanel';

export type FormValues = {
    andreInntektskilder: AndreInntektskilder[];
};

const AndreInntektskilderFieldArray: React.FunctionComponent = () => {
    const intl = useIntl();
    const { control, watch } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'andreInntektskilder',
    });

    const andreInntektskilder = watch('andreInntektskilder');

    return (
        <VStack gap="10">
            {fields.map((field, index) => {
                const inntektskilde = andreInntektskilder[index];
                return (
                    <VStack gap="10" key={field.id}>
                        {index !== 0 && <HorizontalLine />}
                        <RadioGroup
                            name={`andreInntektskilder.${index}.type`}
                            label={<FormattedMessage id="AndreInntektskilderStep.HvilkenTypeAnnenInntekskilder" />}
                            validate={[
                                isRequired(intl.formatMessage({ id: 'AndreInntektskilderStep.Validering.OppgiType' })),
                            ]}
                        >
                            <Radio value={AnnenInntektType.JOBB_I_UTLANDET}>
                                <FormattedMessage id="AndreInntektskilderStep.RadioButton.Utlandet" />
                            </Radio>
                            <Radio value={AnnenInntektType.SLUTTPAKKE}>
                                <FormattedMessage id="AndreInntektskilderStep.RadioButton.Etterlønn" />
                            </Radio>
                            <Radio value={AnnenInntektType.MILITÆRTJENESTE}>
                                <FormattedMessage id="AndreInntektskilderStep.RadioButton.Førstegangstjeneste" />
                            </Radio>
                        </RadioGroup>
                        {inntektskilde.type === AnnenInntektType.JOBB_I_UTLANDET && (
                            <JobbIUtlandetPanel index={index} inntektskilde={inntektskilde} />
                        )}
                        {inntektskilde.type === AnnenInntektType.SLUTTPAKKE && (
                            <EtterlønnEllerSluttvederlagPanel index={index} inntektskilde={inntektskilde} />
                        )}
                        {inntektskilde.type === AnnenInntektType.MILITÆRTJENESTE && (
                            <FørstegangstjenestePanel index={index} inntektskilde={inntektskilde} />
                        )}
                        {index !== 0 && (
                            <HStack>
                                <Button
                                    icon={<XMarkIcon aria-hidden />}
                                    type="button"
                                    variant="tertiary"
                                    onClick={() => remove(index)}
                                >
                                    <FormattedMessage id="AndreInntektskilderStep.Slett" />
                                </Button>
                                <HorizontalLine />
                            </HStack>
                        )}
                    </VStack>
                );
            })}
            <HStack>
                <Button
                    icon={<PlusIcon aria-hidden />}
                    type="button"
                    variant="secondary"
                    // @ts-ignore
                    onClick={() => append({})}
                    size="small"
                >
                    <FormattedMessage id="AndreInntektskilderStep.LeggTil" />
                </Button>
            </HStack>
        </VStack>
    );
};

export default AndreInntektskilderFieldArray;
