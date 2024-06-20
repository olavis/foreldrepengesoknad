import { Component } from 'react';

interface RangeIconProps {
    type: 'plus' | 'minus';
}

export default class RangeIcon extends Component<RangeIconProps> {
    renderPlusIcon() {
        return (
            <path
                d="M18.2616283,12.5217391 L12.5222595,12.5217391 L12.5222595,18.2608696 C12.5222595,18.5488696 12.2874672,18.7826087 12.0004988,18.7826087 C11.7124868,18.7826087 11.478738,18.5488696 11.478738,18.2608696 L11.478738,12.5217391 L5.73936926,12.5217391 C5.4513573,12.5206957 5.21656494,12.288 5.21760846,12 C5.21760846,11.7130435 5.4513573,11.4782609 5.73936926,11.4782609 L11.478738,11.4782609 L11.478738,5.73913043 C11.478738,5.45113043 11.7124868,5.2173913 12.0004988,5.2173913 C12.2874672,5.2173913 12.5222595,5.45113043 12.5222595,5.73913043 L12.5222595,11.4782609 L18.2616283,11.4782609 C18.5485967,11.4782609 18.7844326,11.712 18.783389,12 C18.783389,12.288 18.5496402,12.5217391 18.2616283,12.5217391 Z"
                id="Inner"
                fill="#FFFFFF"
            />
        );
    }

    renderMinusIcon() {
        return (
            <path
                d="M18.2616283,12.5217391 L5.73936926,12.5217391 C5.4513573,12.5206957 5.21656494,12.288 5.21760846,12 C5.21760846,11.7130435 5.4513573,11.4782609 5.73936926,11.4782609 L18.2616283,11.4782609 C18.5485967,11.4782609 18.7844326,11.712 18.783389,12 C18.783389,12.288 18.5496402,12.5217391 18.2616283,12.5217391 Z"
                id="Inner"
                fill="#FFFFFF"
            />
        );
    }

    render() {
        const { type } = this.props;
        const icon = type === 'minus' ? this.renderMinusIcon() : this.renderPlusIcon();

        return (
            <svg
                focusable="false"
                aria-hidden="true"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                className="rangeIcon"
            >
                <g id="Icons/subtract/default" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    {icon}
                </g>
            </svg>
        );
    }
}
