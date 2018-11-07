import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import JaNeiSpørsmål from '../components/ja-nei-sp\u00F8rsm\u00E5l/JaNeiSp\u00F8rsm\u00E5l';

interface InnhenteOpplsyningerOmRevisorSpørsmålProps {
    kanInnhenteOpplysningerFraRevisor?: boolean;
    onChange: (hentOpplysningerOmRevisor: boolean) => void;
}

type Props = InnhenteOpplsyningerOmRevisorSpørsmålProps & InjectedIntlProps;

const KanInnhenteOpplysningerFraRevisorSpørsmål = (props: Props) => {
    const { onChange, kanInnhenteOpplysningerFraRevisor, intl } = props;

    return (
        <JaNeiSpørsmål
            spørsmål={getMessage(intl, 'kanInnhenteOpplysningerFraRevisor.spørsmål')}
            navn="hentOpplysningerFraRevisor"
            valgtVerdi={kanInnhenteOpplysningerFraRevisor}
            onChange={(verdi) => onChange(verdi)}
        />
    );
};

export default injectIntl(KanInnhenteOpplysningerFraRevisorSpørsmål);
