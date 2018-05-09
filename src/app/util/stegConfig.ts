export enum StegID {
    'RELASJON_TIL_BARN' = 'relasjon-til-barn',
    'RELASJON_TIL_BARN_ADOPSJON' = 'relasjon-til-barn-adopsjon',
    'RELASJON_TIL_BARN_STEBARNSADOPSJON' = 'relasjon-til-barn-stebarnsadopsjon',
    'RELASJON_TIL_BARN_FORELDREANSVAR' = 'relasjon-til-barn-foreldreansvar',
    'ANNEN_FORELDER' = 'annen-forelder'
}

export default {
    [StegID.RELASJON_TIL_BARN]: {
        tittel: 'Relasjon til barn header',
        nesteKnapp: 'Fortsett'
    },
    [StegID.RELASJON_TIL_BARN_ADOPSJON]: {
        tittel: 'Relasjon til barn (adopsjon) header',
        nesteKnapp: 'Fortsett'
    },
    [StegID.ANNEN_FORELDER]: {
        tittel: 'Annen forelder header',
        nesteKnapp: 'Fortsett'
    },
    [StegID.RELASJON_TIL_BARN_STEBARNSADOPSJON]: {
        tittel: 'Relasjon til barn tidlig stebarnsadopsjon',
        nesteKnapp: 'Fortsett'
    },
    [StegID.RELASJON_TIL_BARN_FORELDREANSVAR]: {
        tittel: 'Relasjon til barn overtakelse av foreldreansvar',
        nesteKnapp: 'Fortsett'
    }
};
