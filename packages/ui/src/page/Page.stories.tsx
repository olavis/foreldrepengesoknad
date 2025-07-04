import { Meta, StoryObj } from '@storybook/react-vite';

import { Page } from './Page';

const meta = {
    title: 'components/Page',
    component: Page,
} satisfies Meta<typeof Page>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        header: <div>Dette er header</div>,
        children: <div>Dette er children</div>,
    },
};

export const HarAvrundedeNedreHjørner: Story = {
    args: {
        header: <div>Dette er header</div>,
        children: <div>Dette er children</div>,
    },
};
