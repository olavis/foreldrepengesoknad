import { FormattedMessage } from 'react-intl';

import { Alert, VStack } from '@navikt/ds-react';

export const BrukerKanIkkeSøke = () => {
    return (
        <Alert variant="warning">
            <VStack gap="2">
                <FormattedMessage
                    id="inntektsinformasjon.alert.ingenArbeidsforhold.tittel"
                    values={{
                        b: (msg: any) => <b>{msg}</b>,
                    }}
                />
                <div>
                    <FormattedMessage
                        id="inntektsinformasjon.alert.ingenArbeidsforhold"
                        values={{
                            a: (msg: any) => (
                                <a
                                    className="lenke"
                                    rel="noopener noreferrer"
                                    href="https://familie.nav.no/om-svangerskapspenger"
                                >
                                    {msg}
                                </a>
                            ),
                        }}
                    />
                    <FormattedMessage
                        id="inntektsinformasjon.alert.ingenArbeidsforhold.forsettelse"
                        values={{
                            a: (msg: any) => (
                                <a
                                    className="lenke"
                                    rel="noopener noreferrer"
                                    href="https://www.nav.no/no/Nav+og+samfunn/Kontakt+Nav/Relatert+informasjon/chat-med-oss-om-foreldrepenger"
                                >
                                    {msg}
                                </a>
                            ),
                        }}
                    />
                </div>
            </VStack>
        </Alert>
    );
};
