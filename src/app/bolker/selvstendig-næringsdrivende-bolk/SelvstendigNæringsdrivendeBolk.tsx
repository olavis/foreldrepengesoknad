import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Knapp from 'nav-frontend-knapper/lib/knapp';
import { Næring } from '../../types/søknad/SelvstendigNæringsdrivendeInformasjon';
import SelvstendigNæringsdrivendeModal from '../../components/selvstendig-næringsdrivende-modal/SelvstendigNæringsdrivendeModal';
import Block from 'common/components/block/Block';
import List from '../../components/list/List';
import SelvstendigNæringsdrivendeListElement from './SelvstendigNæringsdrivendeListElement';

interface SelvstendigNæringsdrivendeBolkProps {
    renderSpørsmål: () => JSX.Element;
    showNæringsPerioderContent: boolean;
    næringListe: Næring[];
    onChange: (næring: Næring[]) => void;
}

interface SelvstendigNæringsdrivendeBolkState {
    modalIsOpen: boolean;
    næringToEdit?: Næring;
    næringIndex?: number;
}

type SelvstendigNæringsdrivendeBolkStatePartial = Partial<SelvstendigNæringsdrivendeBolkState>;

export default class SelvstendigNæringsdrivendeBolk extends React.Component<
    SelvstendigNæringsdrivendeBolkProps,
    SelvstendigNæringsdrivendeBolkState
> {
    constructor(props: SelvstendigNæringsdrivendeBolkProps) {
        super(props);

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onSelect = this.onSelect.bind(this);

        this.state = {
            modalIsOpen: false
        };
    }

    onAdd(næring: Næring) {
        const { næringListe, onChange } = this.props;
        onChange([...næringListe, næring]);
        this.closeModal();
    }

    onEdit(næring: Næring) {
        const { næringListe, onChange } = this.props;
        const { næringIndex } = this.state;
        const editedNæringListe = næringListe.slice();
        if (næringIndex !== undefined && næringIndex >= 0) {
            editedNæringListe[næringIndex] = næring;
            onChange(editedNæringListe);
        }
        this.closeModal({
            næringIndex: undefined,
            næringToEdit: undefined
        });
    }

    onSelect(næringToEdit: Næring, næringIndex: number) {
        this.openModal({
            næringToEdit,
            næringIndex
        });
    }

    onDelete(næring: Næring) {
        const { næringListe, onChange } = this.props;
        const editedNæringListe = næringListe.slice();
        editedNæringListe.splice(editedNæringListe.indexOf(næring), 1);
        onChange(editedNæringListe);
    }

    openModal(otherState: SelvstendigNæringsdrivendeBolkStatePartial = {}) {
        this.setState({
            ...otherState,
            modalIsOpen: true
        });
    }

    closeModal(otherState: SelvstendigNæringsdrivendeBolkStatePartial = {}) {
        this.setState({
            ...otherState,
            modalIsOpen: false
        });
    }

    render() {
        const { næringListe, renderSpørsmål, showNæringsPerioderContent } = this.props;

        const { næringToEdit } = this.state;

        return (
            <React.Fragment>
                {renderSpørsmål()}
                {showNæringsPerioderContent && (
                    <React.Fragment>
                        <Block margin="s" visible={næringListe.length > 0}>
                            <List
                                data={næringListe}
                                renderElement={(updatedNæring: Næring, index: number) => (
                                    <SelvstendigNæringsdrivendeListElement
                                        næring={updatedNæring}
                                        onEdit={() => this.onSelect(updatedNæring, index)}
                                        onDelete={() => this.onDelete(updatedNæring)}
                                        key={`${updatedNæring.navnPåNæringen}${JSON.stringify(
                                            updatedNæring.tidsperiode
                                        )}`}
                                    />
                                )}
                            />
                        </Block>
                        <Block>
                            <Knapp onClick={() => this.openModal()} htmlType="button">
                                <FormattedMessage id="selvstendigNæringsdrivende.leggTilNæring" />
                            </Knapp>
                        </Block>

                        <SelvstendigNæringsdrivendeModal
                            næring={næringToEdit}
                            isOpen={this.state.modalIsOpen}
                            onCancel={() =>
                                this.closeModal({
                                    næringIndex: undefined,
                                    næringToEdit: undefined
                                })
                            }
                            onSubmit={næringToEdit !== undefined ? this.onEdit : this.onAdd}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}
