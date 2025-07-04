import { ArbeidIUtlandetInput } from 'types/ArbeidIUtlandet';
import { AvtaltFerieDto } from 'types/AvtaltFerie';
import { Barn } from 'types/Barn';

import { Frilans, LocaleNo, NæringDto, UtenlandsoppholdPeriode } from '@navikt/fp-types';

import { AttachmentDTO } from './AttachmentDTO';
import { TilretteleggingDTO } from './TilretteleggingDto';

export interface SøknadDTO {
    språkkode: LocaleNo;
    barn: Barn;
    frilans: Frilans | undefined;
    egenNæring: NæringDto | undefined;
    andreInntekterSiste10Mnd: ArbeidIUtlandetInput[] | undefined;
    utenlandsopphold: UtenlandsoppholdPeriode[] | undefined;
    tilretteleggingsbehov: TilretteleggingDTO[];
    vedlegg: AttachmentDTO[];
    avtaltFerie: AvtaltFerieDto[];
}
