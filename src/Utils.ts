export function HSVtoRGB(h: number, s: number, v: number) {
    let r = 0, g = 0, b = 0, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}


export interface IPosition {
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
}

export function makePosition(target: HTMLElement, e: MouseEvent | TouchEvent): IPosition {
    let r = target.getBoundingClientRect();
    return {
        clientX: 'clientX' in e ? e.clientX : e.touches[0].clientX,
        clientY: 'clientY' in e ? e.clientY : e.touches[0].clientY,
        offsetX: 'offsetX' in e ? e.offsetX : e.touches[0].pageX - r.left,
        offsetY: 'offsetY' in e ? e.offsetY : e.touches[0].pageY - r.top,
    }
}

const isTouchDevice = 'ontouchstart' in document.documentElement;

export type MOUSEEVENT = MouseEvent | TouchEvent;
export const MOUSEDOWN = isTouchDevice ? 'touchstart' : 'mousedown';
export const MOUSEMOVE = isTouchDevice ? 'touchmove' : 'mousemove';
export const MOUSEUP = isTouchDevice ? 'touchend' : 'mouseup';

