import './styles.scss';
import {HSVtoRGB, makePosition} from './Utils';

const canvas = document.getElementById('hsv_canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;
const hueSlider = document.getElementById('hue_slider') as HTMLDivElement;
const huePos = document.getElementById('hue_pos') as HTMLDivElement;

var isTouchDevice = 'ontouchstart' in document.documentElement;

let hue = 0;

function drawCanvas(hue: number) {
    for (let i = 0; i < 101; i++) {
        const gradient = context.createLinearGradient(0, i, 100, i);
        gradient.addColorStop(0, HSVtoRGB(hue / 360, 0, (100 - i) / 100));
        gradient.addColorStop(1, HSVtoRGB(hue / 360, 1, (100 - i) / 100));
        context.fillStyle = gradient;
        context.fillRect(0, i, 100, 1);
    }
}

drawCanvas(hue);

canvas.addEventListener('mousedown', (e) => {
    const onMouseMove = (e: MouseEvent) => {

    };
    const onMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    };
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
});

const onHueChange = (hue: number) => {
    huePos.style.left = Math.round(hue / 360 * 500) + 'px';
    huePos.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    drawCanvas(Math.round(hue));
};


huePos.addEventListener(isTouchDevice ? 'touchstart' : 'mousedown', (e: MouseEvent | TouchEvent) => {
    const pos = makePosition(huePos, e);
    const initX = pos.clientX;
    const initHue = hue;
    onChangeHuePos(huePos, initHue, initX);
    e.stopPropagation();
});

hueSlider.addEventListener(isTouchDevice ? 'touchstart' : 'mousedown', (e: MouseEvent | TouchEvent) => {
    const pos = makePosition(hueSlider, e);
    const initX = pos.clientX;
    hue = pos.offsetX / 500 * 360;
    onHueChange(hue);
    const initHue = hue;
    onChangeHuePos(hueSlider, initHue, initX);
});

const onChangeHuePos = (target: HTMLElement, initHue: number, initX: number) => {
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
        const pos = makePosition(target, e);
        const delta = (pos.clientX - initX) / 500 * 360;
        hue = initHue + delta;
        if (hue < 0) {
            hue = 0;
        } else if (hue > 360) {
            hue = 360;
        }
        onHueChange(hue);
    };
    const onMouseUp = (e: MouseEvent | TouchEvent) => {
        document.removeEventListener(isTouchDevice ? 'touchend' : 'mouseup', onMouseUp);
        document.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', onMouseMove);
    };
    document.addEventListener(isTouchDevice ? 'touchend' : 'mouseup', onMouseUp);
    document.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', onMouseMove);
};

