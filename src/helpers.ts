import type {Block, HexColor} from './types';

function validateHexColor(color: string): color is HexColor {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function makeColorPastel(hexColor: HexColor): HexColor {
  if (!validateHexColor(hexColor)) {
    throw new Error('Please provider a valid hex color!');
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const pastelR = Math.round((r + 255) / 2);
  const pastelG = Math.round((g + 255) / 2);
  const pastelB = Math.round((b + 255) / 2);

  return `#${pastelR.toString(16).padStart(2, '0')}${pastelG
    .toString(16)
    .padStart(2, '0')}${pastelB.toString(16).padStart(2, '0')}`;
}

/**
 * @param factor The factor by which to darken the color (0 to 1).
 * A factor of 0 results in no change, and 1 results in black.
 */
export function darkenColor(hexColor: HexColor, factor: number): HexColor {
  if (!validateHexColor(hexColor)) {
    throw new Error('Please provider a valid hex color!');
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const darkenedR = Math.round(r * (1 - factor));
  const darkenedG = Math.round(g * (1 - factor));
  const darkenedB = Math.round(b * (1 - factor));

  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG
    .toString(16)
    .padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
}

export function getRandomNumberInRangeInclusive(a: number, b: number) {
  const diff = Math.abs(a - b);
  const rangeStart = Math.min(a, b);
  return Math.round(Math.random() * diff) + rangeStart;
}

export function doBlocksOverlap(blockA: Block, blockB: Block) {
  const blockAStart = blockA.columnIndex;
  const blockAEnd = blockA.columnIndex + blockA.columns;
  const blockBStart = blockB.columnIndex;
  const blockBEnd = blockB.columnIndex + blockB.columns;

  return Math.max(blockAStart, blockBStart) < Math.min(blockAEnd, blockBEnd);
}

export function getRowsCount(newBlocks: Array<Block>) {
  const uniqueRowIndices = new Set(newBlocks.map(block => block.rowIndex));

  return uniqueRowIndices.size;
}

/**
 * Adds opacity to a hex color
 * @param hexColor The hex color to add opacity to
 * @param opacity The opacity value from 0 to 1
 * @returns The hex color with opacity
 */
export function addOpacityToHex(hexColor: HexColor, opacity: number): string {
  if (!validateHexColor(hexColor as HexColor)) {
    throw new Error('Please provide a valid hex color!');
  }
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be between 0 and 1');
  }

  // Convert opacity to hex (0-255)
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${opacityHex}`;
}
