export type HexColor = `#${string}`;

export type BlockColumns = 1 | 2 | 3 | 4;

export type Block = {
  id: string;
  columns: BlockColumns;
  startIndex: number;
  color: HexColor;
};
