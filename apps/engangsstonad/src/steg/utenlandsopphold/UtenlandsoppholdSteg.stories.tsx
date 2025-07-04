import { Meta, StoryObj } from '@storybook/react-vite';
import { Action, ContextDataType, EsDataContext } from 'appData/EsDataContext';
import { Path } from 'appData/paths';
import { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from 'storybook/actions';

import { UtenlandsoppholdSteg } from './UtenlandsoppholdSteg';

const promiseAction = () => () => {
    action('button-click')();
    return Promise.resolve();
};

type StoryArgs = {
    gåTilNesteSide?: (action: Action) => void;
} & ComponentProps<typeof UtenlandsoppholdSteg>;

const meta = {
    title: 'steg/UtenlandsoppholdSteg',
    component: UtenlandsoppholdSteg,
    render: ({ gåTilNesteSide = action('button-click'), mellomlagreOgNaviger }) => {
        return (
            <MemoryRouter initialEntries={[Path.UTENLANDSOPPHOLD]}>
                <EsDataContext
                    onDispatch={gåTilNesteSide}
                    initialState={{
                        [ContextDataType.SØKERSITUASJON]: { situasjon: 'fødsel' },
                    }}
                >
                    <UtenlandsoppholdSteg mellomlagreOgNaviger={mellomlagreOgNaviger} />
                </EsDataContext>
            </MemoryRouter>
        );
    },
} satisfies Meta<StoryArgs>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mellomlagreOgNaviger: promiseAction(),
    },
};
