import { InntektsmeldingDto } from '../../../src/api/zodSchemas';

export const medRefusjon = [
    {
        versjon: 2,
        erAktiv: true,
        stillingsprosent: 100,
        inntektPrMnd: 140000,
        refusjonPrMnd: 140000,
        arbeidsgiverNavn: 'Laksinor',
        arbeidsgiverIdent: '123',
        journalpostId: '1017115920',
        mottattTidspunkt: '2024-10-17T00:00:00',
        startDatoPermisjon: '2024-08-01',
        bortfalteNaturalytelser: [],
        refusjonsperioder: [],
    },
] satisfies InntektsmeldingDto[];
