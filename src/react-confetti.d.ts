declare module 'react-confetti' {
    import { ComponentType } from 'react';

    export interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        run?: boolean;
        colors?: string[];
        gravity?: number;
        wind?: number;
        tweenDuration?: number;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
    }

    const Confetti: ComponentType<ConfettiProps>;
    export default Confetti;
}