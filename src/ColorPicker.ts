import {formatRGBtoCSS, HSVtoRGB, makePosition, MOUSEDOWN, MOUSEEVENT, MOUSEMOVE, MOUSEUP} from './Utils';

export interface RGB {
    r: number;
    g: number;
    b: number;
}

type callbackFn = (rgb: RGB) => void;

export interface ColorPicker {
    attach(parentEl: HTMLElement): void;

    detach(): void;

    changeColor(r: number, g: number, b: number, silence?: boolean): void;

    getRGB(): number[];

    onColorChanged(callback: callbackFn): void;
}

export interface ColorPickerStyle {
    paletteWidth: number;
    paletteHeight: number;
    knobRadius: number;
    gap: number;
    sliderHeight: number;
}

class ColorPickerImpl implements ColorPicker {
    private readonly paletteWidth: number;
    private readonly paletteHeight: number;
    private readonly knobRadius: number;
    private readonly quality: number;

    private readonly element: HTMLDivElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly paletteCanvas: HTMLCanvasElement;
    private readonly context2d: CanvasRenderingContext2D;
    private readonly paletteContext2d: CanvasRenderingContext2D;
    private readonly sliderEl!: HTMLDivElement;
    private readonly sliderKnobEl!: HTMLDivElement;
    private observers: callbackFn[] = [];

    private _hue: number = 0;
    private _saturation: number = 0;
    private _value: number = 100;

    constructor(style: ColorPickerStyle, quality = devicePixelRatio) {
        this.paletteWidth = style.paletteWidth;
        this.paletteHeight = style.paletteHeight;
        this.knobRadius = style.knobRadius;
        this.quality = quality;

        this.element = document.createElement('div');
        ({
            canvas: this.canvas,
            context2d: this.context2d,
            paletteCanvas: this.paletteCanvas,
            paletteContext2d: this.paletteContext2d,
        } = this.initCanvas(style));
        this.element.append(this.canvas);
        this.updatePalette();
        ({sliderEl: this.sliderEl, sliderKnobEl: this.sliderKnobEl} = this.initSlider(style));
        this.element.append(this.sliderEl);
        this.handleMouseDownOnCanvas = this.handleMouseDownOnCanvas.bind(this);
        this.handleMouseDownOnSlider = this.handleMouseDownOnSlider.bind(this);
        this.handleMouseDownOnSliderKnob = this.handleMouseDownOnSliderKnob.bind(this);
    }

    public attach(parentEl: HTMLElement): void {
        parentEl.append(this.element);
        this.canvas.addEventListener(MOUSEDOWN, this.handleMouseDownOnCanvas);
        this.sliderEl.addEventListener(MOUSEDOWN, this.handleMouseDownOnSlider);
        this.sliderKnobEl.addEventListener(MOUSEDOWN, this.handleMouseDownOnSliderKnob);
    }

    public detach(): void {
        this.canvas.removeEventListener(MOUSEDOWN, this.handleMouseDownOnCanvas);
        this.sliderEl.removeEventListener(MOUSEDOWN, this.handleMouseDownOnSlider);
        this.sliderKnobEl.removeEventListener(MOUSEDOWN, this.handleMouseDownOnSliderKnob);
        if (!this.element.parentElement) {
            console.error('ColorPicker is not attached yet.');
            return;
        }
        this.element.parentElement.removeChild(this.element);
    }

    public changeColor(r: number, g: number, b: number, silence: boolean = true): void {
    }

    public getRGB(): number[] {
        return [];
    }

    public onColorChanged(callback: callbackFn): void {
        this.observers.push(callback);
    }

    private notify() {
        this.observers.forEach(v => v(HSVtoRGB(this._hue / 360, this._saturation / 100, this._value / 100)));
    }

    private handleMouseDownOnCanvas(e: MOUSEEVENT) {
        const pos = makePosition(this.canvas, e);
        const initX = pos.clientX;
        const initY = pos.clientY;
        const initS = Math.min(100, Math.max(((pos.offsetX - this.knobRadius) / this.paletteWidth) * 100, 0));
        const initV = Math.min(100, Math.max(100 - ((pos.offsetY - this.knobRadius) / this.paletteHeight * 100), 0));

        this._saturation = initS;
        this._value = initV;
        this._onPaintCanvas();
        this.notify();

        const onMouseMove = (e: MOUSEEVENT) => {
            const pos = makePosition(this.canvas, e);

            const deltaX = pos.clientX - initX;
            const deltaY = pos.clientY - initY;
            const deltaS = deltaX / this.paletteWidth * 100;
            this._saturation = Math.min(100, Math.max((initS + deltaS), 0));
            const deltaV = deltaY / this.paletteHeight * 100;
            this._value = Math.min(100, Math.max((initV - deltaV), 0));
            this._onPaintCanvas();
            this.notify();
        };
        const onMouseUp = () => {
            document.removeEventListener(MOUSEUP, onMouseUp);
            document.removeEventListener(MOUSEMOVE, onMouseMove);
        };
        document.addEventListener(MOUSEUP, onMouseUp);
        document.addEventListener(MOUSEMOVE, onMouseMove);
    };

    get canvasWidth(): number {
        return this.paletteWidth * this.knobRadius * 2;
    }

    get canvasHeight(): number {
        return this.paletteHeight * this.knobRadius * 2;
    }

    private initCanvas(style: ColorPickerStyle) {
        const canvas = document.createElement('canvas');
        const context2d = canvas.getContext('2d');
        if (context2d === null) {
            throw Error('Failed to context initialized');
        }
        const paletteCanvas = document.createElement('canvas');
        const paletteContext2d = paletteCanvas.getContext('2d')!;
        if (paletteContext2d === null) {
            throw Error('Failed to context initialized');
        }
        const width = style.paletteWidth + style.knobRadius * 2;
        const height = style.paletteHeight + style.knobRadius * 2;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * this.quality;
        canvas.height = height * this.quality;
        paletteCanvas.width = style.paletteWidth * this.quality;
        paletteCanvas.height = style.paletteHeight * this.quality;
        return {canvas, context2d, paletteCanvas, paletteContext2d}
    }

    private initSlider(style: ColorPickerStyle) {
        const sliderEl = document.createElement('div');
        sliderEl.style.cssText = `
            display: block;
            position: relative;
            width: ${style.paletteWidth}px;
            height: ${style.sliderHeight}px;
            margin: ${style.gap}px ${style.knobRadius}px 0 ${style.knobRadius}px;
            background: linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%)
            ,hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%));
        `;
        const sliderKnobEl = document.createElement('div');
        sliderKnobEl.style.cssText = `
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${style.knobRadius * 2}px;
            height: ${style.knobRadius * 2}px;
            border-radius: 50%;
            background-color: hsl(0, 100%, 50%);
            transform: translate(-50%, -1px);
            border: 2px solid white;
            cursor: pointer;
        `;
        sliderEl.append(sliderKnobEl);
        return {sliderEl, sliderKnobEl};
    }


    private updatePalette(hue: number = this._hue) {
        this.paletteContext2d.save();
        this.paletteContext2d.scale(this.quality, this.quality);
        for (let i = 0; i < this.paletteHeight + 1; i++) {
            const gradient = this.paletteContext2d.createLinearGradient(0, i, this.paletteWidth, i);
            gradient.addColorStop(0, formatRGBtoCSS(HSVtoRGB(hue / 360, 0, (this.paletteWidth - i) / this.paletteWidth)));
            gradient.addColorStop(1, formatRGBtoCSS(HSVtoRGB(hue / 360, 1, (this.paletteWidth - i) / this.paletteWidth)));
            this.paletteContext2d.fillStyle = gradient;
            this.paletteContext2d.fillRect(0, i, this.paletteWidth, 1);
        }
        this.paletteContext2d.restore();
        this._onPaintCanvas();
    }

    private _drawPaletteCursor(s: number, v: number) {
        this.context2d.beginPath();
        this.context2d.arc(this._valueToPosX(s), this._valueToPosY(100 - v), this.knobRadius, 0, 2 * Math.PI);
        this.context2d.fillStyle = formatRGBtoCSS(HSVtoRGB(this._hue / 360, s / 100, v / 100));
        this.context2d.strokeStyle = '#FFFFFF';
        this.context2d.lineWidth = 4;
        this.context2d.stroke();
        this.context2d.fill();
    }

    private _onPaintCanvas() {
        this.context2d.save();
        this.context2d.scale(this.quality, this.quality);
        this.context2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context2d.drawImage(this.paletteCanvas, this.knobRadius, this.knobRadius, this.paletteWidth, this.paletteHeight);
        this._drawPaletteCursor(this._saturation, this._value);
        this.context2d.restore();
    }

    private _valueToPosX(v: number) {
        return v * this.paletteWidth / 100 + this.knobRadius;
    }

    private _valueToPosY(v: number) {
        return v * this.paletteHeight / 100 + this.knobRadius;
    }

    private onHueChanged(hue: number = this._hue) {
        this.sliderKnobEl.style.left = Math.round(hue / 360 * 500) + 'px';
        this.sliderKnobEl.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        this.updatePalette(Math.round(hue));
        this.notify();
    }

    private handleMouseDownOnSliderKnob(e: MOUSEEVENT) {
        const pos = makePosition(this.sliderKnobEl, e);
        const initX = pos.clientX;
        const initHue = this._hue;
        this.handleChangeHueKnob(this.sliderKnobEl, initHue, initX);
        e.stopPropagation();
    }

    private handleMouseDownOnSlider(e: MOUSEEVENT) {
        const pos = makePosition(this.sliderKnobEl, e);
        const initX = pos.clientX;
        this._hue = pos.offsetX / this.paletteWidth * 360;
        this.onHueChanged();
        const initHue = this._hue;
        this.handleChangeHueKnob(this.sliderKnobEl, initHue, initX);
    }

    private handleChangeHueKnob(target: HTMLElement, initHue: number, initX: number) {
        const onMouseMove = (e: MouseEvent | TouchEvent) => {
            const pos = makePosition(target, e);
            const delta = (pos.clientX - initX) / 500 * 360;
            this._hue = initHue + delta;
            if (this._hue < 0) {
                this._hue = 0;
            } else if (this._hue > 360) {
                this._hue = 360;
            }
            this.onHueChanged();
        };
        const onMouseUp = () => {
            document.removeEventListener(MOUSEUP, onMouseUp);
            document.removeEventListener(MOUSEMOVE, onMouseMove);
        };
        document.addEventListener(MOUSEUP, onMouseUp);
        document.addEventListener(MOUSEMOVE, onMouseMove);
    };
}

export function createColorPicker(style: ColorPickerStyle, quality = devicePixelRatio): ColorPicker {
    return new ColorPickerImpl(style, quality);
}
