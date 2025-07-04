import { Meta, StoryObj } from '@storybook/react-vite';
import { Action, ContextDataType, SvpDataContext } from 'appData/SvpDataContext';
import { SøknadRoute } from 'appData/routes';
import { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from 'storybook/actions';

import { Utenlandsopphold } from '@navikt/fp-types';

import { TidligereUtenlandsoppholdSteg } from './TidligereUtenlandsoppholdSteg';

const promiseAction = () => () => {
    action('button-click')();
    return Promise.resolve();
};

type StoryArgs = {
    utenlandsopphold?: Utenlandsopphold;
    gåTilNesteSide?: (action: Action) => void;
} & ComponentProps<typeof TidligereUtenlandsoppholdSteg>;

const meta = {
    title: 'steps/TidligereUtenlandsoppholdSteg',
    component: TidligereUtenlandsoppholdSteg,
    render: ({
        gåTilNesteSide = action('button-click'),
        utenlandsopphold = {
            harBoddUtenforNorgeSiste12Mnd: true,
            skalBoUtenforNorgeNeste12Mnd: false,
        },
        ...rest
    }) => {
        return (
            <MemoryRouter initialEntries={[SøknadRoute.HAR_BODD_I_UTLANDET]}>
                <SvpDataContext
                    onDispatch={gåTilNesteSide}
                    initialState={{
                        [ContextDataType.UTENLANDSOPPHOLD]: utenlandsopphold,
                    }}
                >
                    <TidligereUtenlandsoppholdSteg {...rest} />
                </SvpDataContext>
            </MemoryRouter>
        );
    },
} satisfies Meta<StoryArgs>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mellomlagreSøknadOgNaviger: promiseAction(),
        avbrytSøknad: action('button-click'),
        arbeidsforhold: [],
    },
};
