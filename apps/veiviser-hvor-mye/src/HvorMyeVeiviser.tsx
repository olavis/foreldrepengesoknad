import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ky from 'ky';

import { Loader } from '@navikt/ds-react';

import { ISO_DATE_FORMAT } from '@navikt/fp-constants';
import { Satser, TilgjengeligeStønadskontoer } from '@navikt/fp-types';
import { SimpleErrorPage } from '@navikt/fp-ui';

import { HvorMyeRouter } from './HvorMyeRouter';

const Spinner = () => (
    <div style={{ textAlign: 'center', padding: '12rem 0' }}>
        <Loader size="2xlarge" />
    </div>
);

const STØNADSKONTO_PARAMS = {
    rettighetstype: 'BEGGE_RETT',
    brukerrolle: 'MOR',
    antallBarn: 1,
    fødselsdato: dayjs().format(ISO_DATE_FORMAT),
    morHarUføretrygd: false,
};

export const HvorMyeVeiviser = () => {
    const satserData = useQuery({
        queryKey: ['SATSER'],
        queryFn: () => ky.get(`${import.meta.env.BASE_URL}/rest/satser`).json<Satser>(),
    });

    const stønadskontoerData = useQuery({
        queryKey: ['KONTOER'],
        queryFn: () =>
            ky
                .post(`${import.meta.env.BASE_URL}/rest/konto`, {
                    json: STØNADSKONTO_PARAMS,
                })
                .json<TilgjengeligeStønadskontoer>(),
    });

    if (satserData.error || stønadskontoerData.error) {
        return <SimpleErrorPage />;
    }

    if (!satserData.data || !stønadskontoerData.data) {
        return <Spinner />;
    }

    return <HvorMyeRouter satser={satserData.data} stønadskontoer={stønadskontoerData.data} />;
};
