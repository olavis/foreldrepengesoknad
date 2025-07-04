import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextDataType } from 'appData/FpDataContext';
import { SøknadRoutes } from 'appData/routes';
import dayjs from 'dayjs';

import { DDMMYYYY_DATE_FORMAT, ISO_DATE_FORMAT } from '@navikt/fp-constants';
import { UtenlandsoppholdPeriode } from '@navikt/fp-types';
import { mswWrapper } from '@navikt/fp-utils-test';

import * as stories from './TidligereUtenlandsoppholdSteg.stories';

const { Default } = composeStories(stories);

describe('<TidligereUtenlandsoppholdSteg>', () => {
    it(
        'skal fylle ut tidligere utenlandsopphold og gå videre til inntektsinformasjon når en ikke har fremtidige utenlandsopphold',
        mswWrapper(async ({ setHandlers }) => {
            const gåTilNesteSide = vi.fn();
            const mellomlagreSøknadOgNaviger = vi.fn();

            setHandlers(Default.parameters.msw);
            render(<Default gåTilNesteSide={gåTilNesteSide} mellomlagreSøknadOgNaviger={mellomlagreSøknadOgNaviger} />);

            expect(await screen.findAllByText('Har bodd i utlandet')).toHaveLength(2);

            await userEvent.selectOptions(screen.getByLabelText('Hvilket land bodde du i?'), 'CA');

            const fraOgMed = screen.getByLabelText('Fra og med');
            await userEvent.type(fraOgMed, dayjs().subtract(30, 'day').format(DDMMYYYY_DATE_FORMAT));
            fireEvent.blur(fraOgMed);

            const tilOgMed = screen.getByLabelText('Til og med');
            await userEvent.type(tilOgMed, dayjs().subtract(25, 'day').format(DDMMYYYY_DATE_FORMAT));
            fireEvent.blur(tilOgMed);

            await userEvent.click(screen.getByText('Neste steg'));

            expect(mellomlagreSøknadOgNaviger).toHaveBeenCalledTimes(1);

            expect(gåTilNesteSide).toHaveBeenCalledTimes(2);
            expect(gåTilNesteSide).toHaveBeenNthCalledWith(1, {
                data: [
                    {
                        landkode: 'CA',
                        fom: dayjs().subtract(30, 'day').format(ISO_DATE_FORMAT),
                        tom: dayjs().subtract(25, 'day').format(ISO_DATE_FORMAT),
                    },
                ] satisfies UtenlandsoppholdPeriode[],
                key: ContextDataType.UTENLANDSOPPHOLD_TIDLIGERE,
                type: 'update',
            });
            expect(gåTilNesteSide).toHaveBeenNthCalledWith(2, {
                data: SøknadRoutes.ARBEID_OG_INNTEKT,
                key: ContextDataType.APP_ROUTE,
                type: 'update',
            });
        }),
    );

    it(
        'skal fylle ut tidligere utenlandsopphold og gå videre til senere utenlandsopphold når en har indikert at en har dette',
        mswWrapper(async ({ setHandlers }) => {
            const gåTilNesteSide = vi.fn();
            const mellomlagreSøknadOgNaviger = vi.fn();

            setHandlers(Default.parameters.msw);
            render(
                <Default
                    gåTilNesteSide={gåTilNesteSide}
                    mellomlagreSøknadOgNaviger={mellomlagreSøknadOgNaviger}
                    utenlandsopphold={{ harBoddUtenforNorgeSiste12Mnd: true, skalBoUtenforNorgeNeste12Mnd: true }}
                />,
            );

            expect(await screen.findAllByText('Har bodd i utlandet')).toHaveLength(2);

            await userEvent.selectOptions(screen.getByLabelText('Hvilket land bodde du i?'), 'CA');

            const fraOgMed = screen.getByLabelText('Fra og med');
            await userEvent.type(fraOgMed, dayjs().subtract(30, 'day').format(DDMMYYYY_DATE_FORMAT));
            fireEvent.blur(fraOgMed);

            const tilOgMed = screen.getByLabelText('Til og med');
            await userEvent.type(tilOgMed, dayjs().subtract(25, 'day').format(DDMMYYYY_DATE_FORMAT));
            fireEvent.blur(tilOgMed);

            await userEvent.click(screen.getByText('Neste steg'));

            expect(mellomlagreSøknadOgNaviger).toHaveBeenCalledTimes(1);

            expect(gåTilNesteSide).toHaveBeenCalledTimes(2);
            expect(gåTilNesteSide).toHaveBeenNthCalledWith(1, {
                data: [
                    {
                        landkode: 'CA',
                        fom: dayjs().subtract(30, 'day').format(ISO_DATE_FORMAT),
                        tom: dayjs().subtract(25, 'day').format(ISO_DATE_FORMAT),
                    },
                ] satisfies UtenlandsoppholdPeriode[],
                key: ContextDataType.UTENLANDSOPPHOLD_TIDLIGERE,
                type: 'update',
            });
            expect(gåTilNesteSide).toHaveBeenNthCalledWith(2, {
                data: SøknadRoutes.SENERE_UTENLANDSOPPHOLD,
                key: ContextDataType.APP_ROUTE,
                type: 'update',
            });
        }),
    );

    it(
        'skal lagre route når en går til forrige steg',
        mswWrapper(async ({ setHandlers }) => {
            const gåTilNesteSide = vi.fn();
            const mellomlagreSøknadOgNaviger = vi.fn();

            setHandlers(Default.parameters.msw);
            render(<Default gåTilNesteSide={gåTilNesteSide} mellomlagreSøknadOgNaviger={mellomlagreSøknadOgNaviger} />);

            expect(await screen.findAllByText('Har bodd i utlandet')).toHaveLength(2);
            await userEvent.click(screen.getByText('Forrige steg'));

            expect(mellomlagreSøknadOgNaviger).toHaveBeenCalledTimes(1);

            expect(gåTilNesteSide).toHaveBeenCalledTimes(1);
            expect(gåTilNesteSide).toHaveBeenNthCalledWith(1, {
                data: SøknadRoutes.UTENLANDSOPPHOLD,
                key: ContextDataType.APP_ROUTE,
                type: 'update',
            });
        }),
    );
});
