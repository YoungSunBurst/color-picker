import './styles.scss';
import {createColorPicker} from '../src/ColorPicker';


const appEl = document.getElementById('app')!;
const picker = createColorPicker({paletteWidth: 500, paletteHeight: 500, knobRadius: 10, gap: 100, sliderHeight: 50});
picker.attach(appEl);


// const canvas = document.getElementById('hsv_canvas') as HTMLCanvasElement;
// const context = canvas.getContext('2d')!;
// const hueSlider = document.getElementById('hue_slider') as HTMLDivElement;
// const huePos = document.getElementById('hue_pos') as HTMLDivElement;
// const bufferCanvas = document.createElement('canvas');
// bufferCanvas.palleteWidth = 1000;
// bufferCanvas.palleteHeight = 1000;
// const bufferContext = bufferCanvas.getContext('2d')!;


// let hue = 0;
// let saturation = 0;
// let value = 100;


// function valueToPos(v: number) {
//     return v * 1000 / 100 + 20;
// }
//
// function drawPalette(hue: number) {
//     for (let i = 0; i < 1001; i++) {
//         const gradient = bufferContext.createLinearGradient(0, i, 1000, i);
//         gradient.addColorStop(0, HSVtoRGB(hue / 360, 0, (1000 - i) / 1000));
//         gradient.addColorStop(1, HSVtoRGB(hue / 360, 1, (1000 - i) / 1000));
//         bufferContext.fillStyle = gradient;
//         bufferContext.fillRect(0, i, 1000, 1);
//     }
//     updateCanvas();
// }
//
// function drawPaletteCursor(s: number, v: number) {
//     context.beginPath();
//     context.arc(valueToPos(s), valueToPos(100 - v), 20, 0, 2 * Math.PI);
//     context.fillStyle = HSVtoRGB(hue / 360, s/100, v/100);
//     // console.log(hue / 360, s/100, v/100, context.fillStyle);
//     context.strokeStyle = '#FFFFFF';
//     context.lineWidth = 3;
//     context.stroke();
//     context.fill();
// }
//
// function updateCanvas() {
//     context.clearRect(0, 0, 1040, 1040);
//     context.drawImage(bufferCanvas, 20, 20, 1000, 1000);
//     drawPaletteCursor(saturation, value);
// }
//
// drawPalette(hue);
//
// function posToPalette(p: number) {
//     return p * 1040 / 500;
// }
//
// canvas.addEventListener(MOUSEDOWN, (e) => {
//     const pos = makePosition(canvas, e);
//     const initX = pos.clientX;
//     const initY = pos.clientY;
//     const initS = Math.min(100, Math.max((posToPalette(pos.offsetX) - 20) / 10, 0));
//     const initV = Math.min(100, Math.max(100 - (posToPalette(pos.offsetY) - 20) / 10, 0));
//
//     saturation = initS;
//     value = initV;
//     updateCanvas();
//
//     const onMouseMove = (e: MOUSEEVENT) => {
//         const pos = makePosition(canvas, e);
//
//         const deltaX = pos.clientX - initX;
//         const deltaY = pos.clientY - initY;
//         const deltaS = posToPalette(deltaX) / 10;
//         saturation = Math.min(100, Math.max((initS + deltaS), 0));
//         const deltaV = posToPalette(deltaY) / 10;
//         value = Math.min(100, Math.max((initV - deltaV), 0));
//         updateCanvas();
//     };
//     const onMouseUp = (e: MOUSEEVENT) => {
//         document.removeEventListener(MOUSEUP, onMouseUp);
//         document.removeEventListener(MOUSEMOVE, onMouseMove);
//     };
//     document.addEventListener(MOUSEUP, onMouseUp);
//     document.addEventListener(MOUSEMOVE, onMouseMove);
// });
//
// const onHueChange = (hue: number) => {
//     huePos.style.left = Math.round(hue / 360 * 500) + 'px';
//     huePos.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
//     drawPalette(Math.round(hue));
// };
//
//
// huePos.addEventListener(MOUSEDOWN, (e: MouseEvent | TouchEvent) => {
//     const pos = makePosition(huePos, e);
//     const initX = pos.clientX;
//     const initHue = hue;
//     onChangeHuePos(huePos, initHue, initX);
//     e.stopPropagation();
// });
//
// hueSlider.addEventListener(MOUSEDOWN, (e: MouseEvent | TouchEvent) => {
//     const pos = makePosition(hueSlider, e);
//     const initX = pos.clientX;
//     hue = pos.offsetX / 500 * 360;
//     onHueChange(hue);
//     const initHue = hue;
//     onChangeHuePos(hueSlider, initHue, initX);
// });
//
// const onChangeHuePos = (target: HTMLElement, initHue: number, initX: number) => {
//     const onMouseMove = (e: MouseEvent | TouchEvent) => {
//         const pos = makePosition(target, e);
//         const delta = (pos.clientX - initX) / 500 * 360;
//         hue = initHue + delta;
//         if (hue < 0) {
//             hue = 0;
//         } else if (hue > 360) {
//             hue = 360;
//         }
//         onHueChange(hue);
//     };
//     const onMouseUp = (e: MOUSEEVENT) => {
//         document.removeEventListener(MOUSEUP, onMouseUp);
//         document.removeEventListener(MOUSEMOVE, onMouseMove);
//     };
//     document.addEventListener(MOUSEUP, onMouseUp);
//     document.addEventListener(MOUSEMOVE, onMouseMove);
// };
//
