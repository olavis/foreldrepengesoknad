import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';

import { mswWrapper } from '@navikt/fp-utils-test';

import * as stories from './Saksoversikt.stories';

const { Engangsstønad, Foreldrepenger, Svangerskapspenger } = composeStories(stories);

describe('<Saksoversikt>', () => {
    it(
        'skal vise hvor mye engangsstønad en har rett på',
        mswWrapper(async ({ setHandlers }) => {
            setHandlers(Engangsstønad.parameters.msw);
            render(<Engangsstønad />);

            expect(await screen.findByText('Dette har du søkt om')).toBeInTheDocument();

            expect(screen.getByText('Engangsstønad på 92 648 kr')).toBeInTheDocument();
            expect(screen.getByText('Utbetales til kontonummer 23232323 hvis søknaden innvilges')).toBeInTheDocument();
            expect(screen.getByText('Endre kontonummer')).toBeInTheDocument();
        }),
    );

    it(
        'skal kun vise Endre plan lenke for foreldrepenger',
        mswWrapper(async ({ setHandlers }) => {
            setHandlers(Foreldrepenger.parameters.msw);
            render(<Foreldrepenger />);
            expect(await screen.findByText('Endre planen din')).toBeInTheDocument();
        }),
    );

    it(
        'skal IKKE vise Endre plan lenke for svangerskapspenger',
        mswWrapper(async ({ setHandlers }) => {
            setHandlers(Svangerskapspenger.parameters.msw);
            render(<Svangerskapspenger />);

            // Sjekk at tittel er på plass sånn at vi vet siden har lastet ...
            expect(await screen.findByText('Din sak')).toBeInTheDocument();
            expect((await screen.findAllByText('SVANGERSKAPSPENGER')).length).toBeGreaterThan(0);

            // ... når vi senere skal sjekke for at noe ikke eksisterer.
            expect(screen.queryByText('Endre planen din')).not.toBeInTheDocument();
        }),
    );

    it(
        'skal IKKE vise Endre plan lenke for engangsstønad',
        mswWrapper(async ({ setHandlers }) => {
            setHandlers(Engangsstønad.parameters.msw);
            render(<Engangsstønad />);

            // Sjekk at tittel er på plass sånn at vi vet siden har lastet ...
            expect(await screen.findByText('Din sak')).toBeInTheDocument();
            expect((await screen.findAllByText('ENGANGSSTØNAD')).length).toBeGreaterThan(0);

            // ... når vi senere skal sjekke for at noe ikke eksisterer.
            expect(screen.queryByText('Endre planen din')).not.toBeInTheDocument();
        }),
    );
});
