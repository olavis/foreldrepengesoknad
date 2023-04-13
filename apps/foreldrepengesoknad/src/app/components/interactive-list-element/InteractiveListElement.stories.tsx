import { StoryFn } from '@storybook/react';
import React from 'react';

import InteractiveListElement from './InteractiveListElement';

export default {
    title: 'components/InteractiveListElement',
    component: InteractiveListElement,
};

export const Default: StoryFn<typeof InteractiveListElement> = () => (
    <InteractiveListElement
        title="Dette er en tittel"
        text="Dette er en tekst"
        onEdit={() => alert('editering pågår')}
        onDelete={() => alert('sletting pågår')}
        deleteLinkText="Slett"
        editButtonAriaText="editaria"
        deleteButtonAriaText="deletearia"
    />
);

export const ManglendeDokumentasjon: StoryFn<typeof InteractiveListElement> = () => (
    <InteractiveListElement
        title="Dette er en tittel"
        text="Dette er en tekst"
        onEdit={() => alert('editering pågår')}
        onDelete={() => alert('sletting pågår')}
        deleteLinkText="Slett"
        editButtonAriaText="editaria"
        deleteButtonAriaText="deletearia"
        missingDocumentation
    />
);
