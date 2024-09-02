import { FunctionComponent } from 'react';

import { Attachment } from '@navikt/fp-types';
import { bemUtils } from '@navikt/fp-utils';

import Block from 'app/pages/block/Block';

import { getDokumentasjonStringAndreInntekter } from '../../dokumentasjonUtils';
import VedleggListe from '../VedleggListe';
import './../dokumentasjon.css';

interface Props {
    vedlegg: Attachment[];
}

const AndreInntekterDokumentasjon: FunctionComponent<Props> = ({ vedlegg }) => {
    const bem = bemUtils('dokumentasjon');

    if (vedlegg.length === 0) {
        return null;
    }

    return (
        <div>
            <Block padBottom="l">
                <div className={bem.block}>{getDokumentasjonStringAndreInntekter(vedlegg)}</div>
            </Block>
            <VedleggListe vedlegg={vedlegg} />
        </div>
    );
};

export default AndreInntekterDokumentasjon;
