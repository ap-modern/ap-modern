// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - tinycolor2 types may not be available
import tinycolor from 'tinycolor2';

const hueStep = 2;
const saturationStep = 16;
const saturationStep2 = 5;
const brightnessStep1 = 5;
const brightnessStep2 = 15;
const lightColorCount = 5;
const darkColorCount = 4;

function getHue(hsv: tinycolor.ColorFormats.HSVA, i: number, isLight: boolean): number {
  let hue: number;
  if (hsv.h >= 60 && hsv.h <= 240) {
    hue = isLight ? hsv.h - hueStep * i : hsv.h + hueStep * i;
  } else {
    hue = isLight ? hsv.h + hueStep * i : hsv.h - hueStep * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return Math.round(hue);
}

function getSaturation(hsv: tinycolor.ColorFormats.HSVA, i: number, isLight: boolean): number {
  let saturation: number;
  if (isLight) {
    saturation = Math.round(hsv.s * 100) - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = Math.round(hsv.s * 100) + saturationStep;
  } else {
    saturation = Math.round(hsv.s * 100) + saturationStep2 * i;
  }
  if (saturation > 100) {
    saturation = 100;
  }
  if (isLight && i === lightColorCount && saturation > 10) {
    saturation = 10;
  }
  if (saturation < 6) {
    saturation = 6;
  }
  return Math.round(saturation);
}

function getValue(hsv: tinycolor.ColorFormats.HSVA, i: number, isLight: boolean): number {
  if (isLight) {
    return Math.round(hsv.v * 100) + brightnessStep1 * i;
  }
  return Math.round(hsv.v * 100) - brightnessStep2 * i;
}

const lightenRatio = 1;
const darkenRatio = 1;

export function colorPalette(color: string, index: number, isAlpha = false): string {
  if (isAlpha) {
    return alphaPalette(color, index);
  }
  const isLight = index <= 6;
  const hsv = tinycolor(color).toHsv();
  const i = isLight
    ? lightColorCount + lightenRatio - index
    : index - lightColorCount - darkenRatio;
  return tinycolor({
    h: getHue(hsv, i, isLight),
    s: getSaturation(hsv, i, isLight) / 100,
    v: getValue(hsv, i, isLight) / 100,
  }).toHexString();
}

const blightenRatio = 1.5;
const bdarkenRatio = 0.7;

function alphaPalette(color: string, index: number): string {
  const isLight = index <= 6;
  const i = isLight
    ? lightColorCount + blightenRatio - index
    : index - lightColorCount - bdarkenRatio;
  return isLight
    ? tinycolor(color)
        .lighten(i * 8)
        .toHexString()
    : tinycolor(color)
        .darken(i * brightnessStep2)
        .toHexString();
}

export function fadeOut(color: string, alpha: number): string {
  return tinycolor(color)
    .setAlpha(alpha / 100)
    .toRgbString();
}

export function lighten(color: string, amount: number): string {
  return tinycolor(color).lighten(amount).toHexString();
}
