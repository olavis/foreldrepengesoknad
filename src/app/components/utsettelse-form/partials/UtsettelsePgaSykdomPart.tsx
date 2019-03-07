import * as React from 'react';
import { UtsettelseÅrsakType } from '../../../types/uttaksplan/periodetyper';
import { Forelder } from 'common/types';
import Block from 'common/components/block/Block';
import FlervalgSpørsmål, { FlervalgAlternativ } from '../../flervalg-spørsmål/FlervalgSpørsmål';
import getMessage from 'common/util/i18nUtils';
import { InjectedIntl, injectIntl, InjectedIntlProps } from 'react-intl';
import { Attachment } from 'common/storage/attachment/types/Attachment';
import { Skjemanummer } from '../../../types/søknad/Søknad';
import { AttachmentType } from 'common/storage/attachment/types/AttachmentType';
import VedleggSpørsmål from '../../vedlegg-spørsmål/VedleggSpørsmål';
import Veilederpanel from 'nav-frontend-veilederpanel';
import Veileder from 'common/components/veileder/Veileder';
import VeilederpanelInnhold from 'app/components/veilederpanel-innhold/VeilederpanelInnhold';

export interface UtsettelsePgaSykdomChangePayload {
    sykdomsårsak: UtsettelseÅrsakType;
    vedlegg: Attachment[];
}

export interface OwnProps {
    forelder: Forelder;
    sykdomsårsak?: UtsettelseÅrsakType;
    vedlegg: Attachment[];
    onChange: (payload: UtsettelsePgaSykdomChangePayload) => void;
}

export const visVedlegg = (sykdomsårsak?: UtsettelseÅrsakType) => sykdomsårsak !== undefined;

const getSykdomAlternativ = (intl: InjectedIntl, årsak: UtsettelseÅrsakType): FlervalgAlternativ => {
    return {
        label: getMessage(intl, `utsettelse.sykdom.alternativ.${årsak}`),
        value: årsak
    };
};

const getSykdomVeilederInfo = (sykdomsårsak: UtsettelseÅrsakType) => {
    if (sykdomsårsak === UtsettelseÅrsakType.Sykdom) {
        return 'utsettelse.sykdom.vedlegg.info.sykdom';
    } else if (sykdomsårsak === UtsettelseÅrsakType.InstitusjonBarnet) {
        return 'utsettelse.sykdom.vedlegg.info.barnInnlagt';
    } else {
        return 'utsettelse.sykdom.vedlegg.info.innlagt';
    }
};

type Props = OwnProps & InjectedIntlProps;

class UtsettelsePgaSykdomPart extends React.Component<Props> {
    getAttachmentSkjemanummer() {
        const { sykdomsårsak } = this.props;
        switch (sykdomsårsak) {
            case UtsettelseÅrsakType.Sykdom:
                return Skjemanummer.DOK_OVERFØRING_FOR_SYK;
            case UtsettelseÅrsakType.InstitusjonSøker:
            case UtsettelseÅrsakType.InstitusjonBarnet:
                return Skjemanummer.DOK_INNLEGGELSE;
            default:
                return Skjemanummer.ANNET;
        }
    }

    render() {
        const { onChange, intl, sykdomsårsak } = this.props;
        const vedleggList = [...this.props.vedlegg];
        return (
            <>
                <Block>
                    <FlervalgSpørsmål
                        navn="utsttelsePgaSykdomÅrsak"
                        spørsmål={getMessage(intl, 'utsettelse.sykdom.alternativer.spørsmål')}
                        valgtVerdi={sykdomsårsak}
                        onChange={(årsak: UtsettelseÅrsakType) =>
                            onChange({ sykdomsårsak: årsak, vedlegg: vedleggList })
                        }
                        toKolonner={true}
                        alternativer={[
                            getSykdomAlternativ(intl, UtsettelseÅrsakType.Sykdom),
                            getSykdomAlternativ(intl, UtsettelseÅrsakType.InstitusjonSøker),
                            getSykdomAlternativ(intl, UtsettelseÅrsakType.InstitusjonBarnet)
                        ]}
                    />
                </Block>
                {visVedlegg(sykdomsårsak) && (
                    <Block>
                        <Veilederpanel kompakt={true} svg={<Veileder stil="kompakt-uten-bakgrunn" />}>
                            <VeilederpanelInnhold
                                messages={[
                                    {
                                        type: 'normal',
                                        contentIntlKey: getSykdomVeilederInfo(sykdomsårsak!)
                                    }
                                ]}
                            />
                        </Veilederpanel>
                        <VedleggSpørsmål
                            vedlegg={vedleggList}
                            attachmentType={AttachmentType.UTSETTELSE_SYKDOM}
                            skjemanummer={this.getAttachmentSkjemanummer()}
                            onChange={(vedlegg) => onChange({ vedlegg, sykdomsårsak: sykdomsårsak! })}
                        />
                    </Block>
                )}
            </>
        );
    }
}
export default injectIntl(UtsettelsePgaSykdomPart);
