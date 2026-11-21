import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.2 2 4 13.4h6.1L9.2 22 20 9.8h-6.3L13.2 2Z" />
        </svg>
    );
}
