import './styles.scss';
import {createColorPicker, RGB} from '../src/ColorPicker';

const appEl = document.getElementById('app')!;
const rEl = document.getElementById('rgb_r') as HTMLInputElement;
const gEl = document.getElementById('rgb_b') as HTMLInputElement;
const bEl = document.getElementById('rgb_g') as HTMLInputElement;
const picker = createColorPicker({paletteWidth: 500, paletteHeight: 500, knobRadius: 10, gap: 10, sliderHeight: 20});
picker.attach(appEl);
picker.onColorChanged( (rgb: RGB) => {
    rEl.value = rgb.r + '';
    gEl.value = rgb.g + '';
    bEl.value = rgb.b + '';
});

