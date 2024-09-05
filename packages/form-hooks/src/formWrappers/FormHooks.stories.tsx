import { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

import { Alert, BodyShort, Checkbox as DsCheckbox, HStack, Heading, Label, Radio, VStack } from '@navikt/ds-react';

import Checkbox from './Checkbox';
import CheckboxGroup from './CheckboxGroup';
import Combobox from './Combobox';
import DateRangepicker from './DateRangepicker';
import Datepicker from './Datepicker';
import Form from './Form';
import RadioGroup from './RadioGroup';
import Select from './Select';
import TextArea from './TextArea';
import TextField from './TextField';

const meta = {
    title: 'FormHooks',
    render: () => {
        const formMethods = useForm({
            defaultValues: {
                radiopre: true,
                testSelectFieldpre: 'value3',
                datepickerFieldPre: '2022-10-22',
                checkpre: true,
                textfieldpre: 'Har en tekst',
                textareapre: 'Har en tekst',
                checkpanelpre: ['test1', 'test2'],
                comboboxPre: 'Tekst 1',
                dateRangepickerFieldFromPre: '2024-08-01',
                dateRangepickerFieldToPre: '2024-09-22',
            },
        });

        const stateVerdier = formMethods.watch();

        return (
            <Form formMethods={formMethods}>
                <HStack justify="space-between">
                    <VStack gap="7" align="start">
                        <Checkbox name="check" label="Dette er en checkbox" />
                        <Checkbox name="checkpre" label="Dette er en checkbox som er valgt" />
                        <CheckboxGroup name="checkpanel" label="Dette er en gruppe med checkboxes">
                            <DsCheckbox value="test1">test1</DsCheckbox>
                            <DsCheckbox value="test2">test2</DsCheckbox>
                        </CheckboxGroup>
                        <CheckboxGroup name="checkpanelpre" label="Dette er en gruppe med checkboxes som er preutfyllt">
                            <DsCheckbox value="test1">test1</DsCheckbox>
                            <DsCheckbox value="test2">test2</DsCheckbox>
                        </CheckboxGroup>
                        <TextField name="textfield" label="Dette er et tekstfelt" />
                        <TextField
                            name="textfieldpre"
                            label="Dette er et tekstfelt med preutfyllt verdi"
                            description="Beskrivelse"
                        />
                        <TextArea name="textarea" label="Dette er et tekstarea" description="beskrivelse" />
                        <TextArea name="textareapre" label="Dette er et tekstarea som er preutfyllt" />
                        <Combobox
                            label="Dette er en combobox"
                            name="combobox"
                            options={['Valg 1', 'Valg 2', 'Tekst 1', 'Tekst 2']}
                        />
                        <Combobox
                            label="Dette er en combobox der verdi er valgt"
                            name="comboboxPre"
                            options={['Valg 1', 'Valg 2', 'Tekst 1', 'Tekst 2']}
                        />
                        <RadioGroup
                            name="radio"
                            description="Dette er en mer utfyllende tekst"
                            label="Dette er en radioknapp"
                        >
                            <Radio value="verdi1">Verdi 1</Radio>
                            <Radio value="verdi2">Verdi 2</Radio>
                        </RadioGroup>
                        <RadioGroup
                            name="radiopre"
                            description="Dette er en radioknapp med preutfyllt verdi - beskrivelse"
                            label="Dette er en radioknapp med preutfyllt verdi"
                        >
                            <Radio value={true}>True</Radio>
                            <Radio value={false}>False</Radio>
                        </RadioGroup>
                        <Select
                            label="Dette er en dropdown"
                            name="testSelectField"
                            description="Dette er en nærmere beskrivelse"
                        >
                            <option value="value1" key="1">
                                Test 1
                            </option>
                            <option value="value2" key="2">
                                Test 2
                            </option>
                        </Select>
                        <Select label="Dette er en dropdown der verdi er valgt" name="testSelectFieldpre">
                            <option value="value3" key="1">
                                Test 3
                            </option>
                            <option value="value4" key="2">
                                Test 4
                            </option>
                        </Select>
                        <Datepicker
                            label="Dette er en datepicker"
                            name="datepickerField"
                            description="Dette er en mer utfyllende tekst"
                            maxDate={dayjs().add(10, 'day').toDate()}
                            minDate={dayjs().subtract(10, 'day').toDate()}
                            showMonthAndYearDropdowns
                        />
                        <Datepicker label="Dette er en datepicker der verdi er valgt" name="datepickerFieldPre" />
                        <div>
                            <Heading size="small">dateRangepicker</Heading>
                            <DateRangepicker
                                nameFrom="dateRangepickerFieldFrom"
                                nameTo="dateRangepickerFieldTo"
                                labelFrom="Fom"
                                labelTo="Tom"
                                useStrategyAbsolute
                            />
                        </div>
                        <div>
                            <Heading size="small">dateRangepicker med verdi</Heading>
                            <DateRangepicker
                                nameFrom="dateRangepickerFieldFromPre"
                                nameTo="dateRangepickerFieldToPre"
                                labelFrom="Fom"
                                labelTo="Tom"
                                useStrategyAbsolute
                            />
                        </div>
                    </VStack>
                    <div>
                        <Alert variant="info">
                            <VStack gap="5">
                                <Label>Values in form state:</Label>
                                {Object.entries(stateVerdier).map((entry) => (
                                    <BodyShort key={entry[0]}>{entry[0] + ': ' + entry[1]}</BodyShort>
                                ))}
                            </VStack>
                        </Alert>
                    </div>
                </HStack>
            </Form>
        );
    },
} satisfies Meta;
export default meta;

export const VisFormkomponenter: StoryObj = {};
