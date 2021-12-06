import {HSVtoRGB, makePosition, MOUSEDOWN, MOUSEEVENT, MOUSEMOVE, MOUSEUP} from './Utils';

export interface ColorPicker {
    attach(parentEl: HTMLElement): void;
    detach(): void;
    changeColor(rgb: number[]): void;
    getRGB(): number[];
    onColorChanged(callback: (rgb: number[]) => void): void;
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

    private readonly canvas: HTMLCanvasElement;
    private readonly paletteCanvas: HTMLCanvasElement;
    private readonly context2d: CanvasRenderingContext2D;
    private readonly paletteContext2d: CanvasRenderingContext2D;

    private _hue: number = 0;
    private _saturation: number = 0;
    private _value: number = 100;
    private readonly element: HTMLDivElement;

    constructor(style: ColorPickerStyle, quality = devicePixelRatio) {
        this.paletteWidth = style.paletteWidth;
        this.paletteHeight = style.paletteHeight;
        this.knobRadius = style.knobRadius;
        this.quality = quality;

        this.element = document.createElement('div');
        this.canvas = document.createElement('canvas');
        const context2d = this.canvas.getContext('2d');
        if (context2d === null) {
            throw Error('Failed to context initialized');
        }
        this.element.append(this.canvas);
        this.context2d = context2d;
        this.paletteCanvas = document.createElement('canvas');
        const paletteContext2d = this.paletteCanvas.getContext('2d')!;
        if (paletteContext2d === null) {
            throw Error('Failed to context initialized');
        }
        this.paletteContext2d = paletteContext2d;
        this.initCanvas();
    }

    public attach(parentEl: HTMLElement): void {
        parentEl.append(this.element);
        this.canvas.addEventListener(MOUSEDOWN, this.handleMouseOnCanvas.bind(this));
    }

    private handleMouseOnCanvas(e: MOUSEEVENT) {
        const pos = makePosition(this.canvas, e);
        const initX = pos.clientX;
        const initY = pos.clientY;
        const initS = Math.min(100, Math.max(((pos.offsetX - this.knobRadius) / this.paletteWidth) * 100, 0));
        const initV = Math.min(100, Math.max(100 - ((pos.offsetY - this.knobRadius) / this.paletteHeight * 100), 0));

        this._saturation = initS;
        this._value = initV;
        this._onPaintCanvas();

        const onMouseMove = (e: MOUSEEVENT) => {
            const pos = makePosition(this.canvas, e);

            const deltaX = pos.clientX - initX;
            const deltaY = pos.clientY - initY;
            const deltaS = deltaX / this.paletteWidth * 100;
            this._saturation = Math.min(100, Math.max((initS + deltaS), 0));
            const deltaV = deltaY / this.paletteHeight * 100;
            this._value = Math.min(100, Math.max((initV - deltaV), 0));
            this._onPaintCanvas();
        };
        const onMouseUp = () => {
            document.removeEventListener(MOUSEUP, onMouseUp);
            document.removeEventListener(MOUSEMOVE, onMouseMove);
        };
        document.addEventListener(MOUSEUP, onMouseUp);
        document.addEventListener(MOUSEMOVE, onMouseMove);
    };

    public detach(): void {
        if (!this.element.parentElement) {
            console.error('ColorPicker is not attached yet.');
            return;
        }
        this.element.parentElement.removeChild(this.element);
    }

    public changeColor(rgb: number[]): void {
    }

    public getRGB(): number[] {
        return [];
    }

    public onColorChanged(callback: (rgb: number[]) => void): void {
    }

    private initCanvas() {
        const width = this.paletteWidth + this.knobRadius * 2;
        const height = this.paletteHeight + this.knobRadius * 2;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * this.quality;
        this.canvas.height = height * this.quality;
        this.paletteCanvas.width = this.paletteWidth * this.quality;
        this.paletteCanvas.height = this.paletteHeight * this.quality;
        this.updatePalette();
    }

    get canvasWidth(): number {
        return this.paletteWidth * this.knobRadius * 2;
    }

    get canvasHeight(): number {
        return this.paletteHeight * this.knobRadius * 2;
    }

    private updatePalette(hue: number = this._hue) {
        this.paletteContext2d.save();
        this.paletteContext2d.scale(this.quality, this.quality);
        for (let i = 0; i < this.paletteHeight + 1; i++) {
            const gradient = this.paletteContext2d.createLinearGradient(0, i, this.paletteWidth, i);
            gradient.addColorStop(0, HSVtoRGB(hue / 360, 0, (this.paletteWidth - i) / this.paletteWidth));
            gradient.addColorStop(1, HSVtoRGB(hue / 360, 1, (this.paletteWidth - i) / this.paletteWidth));
            this.paletteContext2d.fillStyle = gradient;
            this.paletteContext2d.fillRect(0, i, this.paletteWidth, 1);
        }
        this._onPaintCanvas();
    }

    private _drawPaletteCursor(s: number, v: number) {
        this.context2d.beginPath();
        this.context2d.arc(this._valueToPosX(s), this._valueToPosY(100 - v), this.knobRadius, 0, 2 * Math.PI);
        this.context2d.fillStyle = HSVtoRGB(this._hue / 360, s/100, v/100);
        this.context2d.strokeStyle = '#FFFFFF';
        this.context2d.lineWidth = this.knobRadius * 0.2;
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
}

export function createColorPicker(style: ColorPickerStyle, quality = devicePixelRatio): ColorPicker {
    return new ColorPickerImpl(style, quality);
}
