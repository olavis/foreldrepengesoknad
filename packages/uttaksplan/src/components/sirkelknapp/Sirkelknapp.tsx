import classnames from 'classnames';

import { guid } from '../../utils/guid';
import { preventDoubleTapZoom } from '../../utils/preventDoubleTapZoom';
import AriaText from '../aria-text/AriaText';
import './sirkelknapp.less';

export type Stil = 'hvit' | 'bla' | 'info';

export interface SirkelknappProps {
    /** Tekst som blir lest opp og satt som tittel på knappen */
    ariaLabel: string;
    /** Ikon som brukes inne i knappen */
    ikon: React.ReactNode;
    /** Funksjon som kalles knappen klikkes på */
    onClick: () => void;
    /** Om knappen er disabled eller ikke. Default false. */
    disabled?: boolean;
    /** Om knappen skal ha tilstanded pressed/valgt. Default false. */
    toggle?: {
        pressed: boolean;
    };
    /** Layout varianter */
    stil?: Stil;
    /** Størrelse - default normal */
    size?: 'normal' | 'stor';
    posisjoneringFraHøyre?: number;
}
// eslint-disable-next-line @typescript-eslint/no-restricted-types
const Sirkelknapp: React.FunctionComponent<SirkelknappProps> = ({
    onClick,
    ariaLabel,
    ikon,
    toggle,
    disabled,
    stil = 'info',
    size = 'normal',
    posisjoneringFraHøyre,
}) => {
    const labelId = guid();
    return (
        <button
            style={{ left: posisjoneringFraHøyre }}
            type="button"
            onClick={() => onClick()}
            onTouchStart={preventDoubleTapZoom}
            aria-labelledby={labelId}
            className={classnames(`sirkelknapp`, `sirkelknapp--${stil}`, `sirkelknapp--${size}`, {
                'sirkelknapp--pressed': toggle?.pressed,
                'sirkelknapp--disabled': disabled,
            })}
            disabled={disabled}
            aria-pressed={toggle ? toggle.pressed : undefined}
        >
            <span className="sirkelknapp__ikon" role="presentation">
                {ikon}
            </span>
            <AriaText id={labelId}>{ariaLabel}</AriaText>
        </button>
    );
};
// eslint-disable-next-line import/no-default-export
export default Sirkelknapp;
