import { CSSProperties, FunctionComponent, ReactNode, useCallback, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { TextField } from '@navikt/ds-react';

import { getError, getValidationRules, replaceInvisibleCharsWithSpace } from './formUtils';

export interface Props {
    name: string;
    label?: string | ReactNode;
    validate?: Array<(value: string) => any> | Array<(value: number) => any>;
    description?: string;
    onChange?: (value: any) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    type?: 'email' | 'password' | 'tel' | 'text' | 'url';
    className?: string;
    style?: CSSProperties;
    shouldReplaceInvisibleChars?: boolean;
    autofocusWhenEmpty?: boolean;
    customErrorFormatter?: (error: string | undefined) => ReactNode;
}

const RhfTextField: FunctionComponent<Props> = ({
    name,
    label,
    validate = [],
    type,
    onChange,
    description,
    autoFocus,
    disabled,
    className,
    style,
    shouldReplaceInvisibleChars = false,
    autofocusWhenEmpty,
    customErrorFormatter,
}) => {
    const {
        formState: { errors },
    } = useFormContext();

    const { field } = useController({
        name,
        disabled,
        rules: {
            validate: useMemo(() => getValidationRules(validate), [validate]),
        },
    });

    const onChangeFn = useCallback(
        (evt: React.ChangeEvent<HTMLInputElement>) => {
            const parsedValues = shouldReplaceInvisibleChars
                ? replaceInvisibleCharsWithSpace(evt.currentTarget.value)
                : evt.currentTarget.value;

            field.onChange(parsedValues);

            if (onChange) {
                onChange(parsedValues);
            }
        },
        [field, onChange, shouldReplaceInvisibleChars],
    );

    return (
        <TextField
            ref={field.ref}
            value={field.value || ''}
            label={label}
            description={description}
            type={type}
            error={customErrorFormatter ? customErrorFormatter(getError(errors, name)) : getError(errors, name)}
            autoFocus={autoFocus || (autofocusWhenEmpty && field.value === undefined)}
            autoComplete="off"
            disabled={disabled}
            className={className}
            style={style}
            onChange={onChangeFn}
        />
    );
};

export default RhfTextField;
