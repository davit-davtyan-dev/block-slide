import React from 'react';
import {Row, Text, TouchableOpacity, View} from './components';
import Matrix from './Matrix';
import BlockComponent from './Block';
import Menu from './components/Menu/Menu';
import GameOverView from './GameOverView';
import {useGameStore} from './store/store';
import {useTheme} from './contexts/ThemeContext';

import type {Block} from './types';

export default function GameScreen() {
  const blockPixelSize = useGameStore(state => state.blockPixelSize);
  const matrixWidth = useGameStore(state => state.matrixWidth);
  const blocks = useGameStore(state => state.blocks);
  const restart = useGameStore(state => state.restart);
  const {theme} = useTheme();

  const [upcomingBlocks, blocksToRender] = [...blocks]
    .sort((a, b) => (a.columnIndex > b.columnIndex ? 1 : -1))
    .reduce(
      (acc, block) => {
        if (block.rowIndex === 0) {
          acc[0].push(block);
        } else {
          acc[1].push(block);
        }
        return acc;
      },
      [[], []] as Array<Array<Block>>,
    );

  const blocksByRow = blocksToRender.reduce((acc, block) => {
    acc[block.rowIndex] ||= [];

    acc[block.rowIndex].push(block);
    return acc;
  }, [] as Array<Array<Block>>);

  const sortedBlocksByRow = blocksByRow.map(row =>
    row.sort((a, b) => (a.columnIndex > b.columnIndex ? 1 : -1)),
  );

  return (
    <View center h="100%" bgColor={theme.backgroundColor}>
      <TouchableOpacity
        mt={8}
        py={2}
        px={8}
        onPress={restart}
        borderWidth={1}
        borderRadius={8}
        bgColor={theme.backgroundColor}
        borderColor={theme.mainColor}>
        <Text color={theme.mainColor}>Restart</Text>
      </TouchableOpacity>

      <Matrix>
        {blocksToRender.map(block => {
          const blocksOfTheSameRow = sortedBlocksByRow[block.rowIndex];
          const blocksToTheRight = blocksOfTheSameRow.filter(
            neighborBlock => neighborBlock.columnIndex > block.columnIndex,
          );
          const blocksToTheLeft = blocksOfTheSameRow.filter(
            neighborBlock => neighborBlock.columnIndex < block.columnIndex,
          );

          const rightNeighbor = blocksToTheRight[0];
          const leftNeighbor = blocksToTheLeft[blocksToTheLeft.length - 1];

          return (
            <React.Fragment key={block.id}>
              <BlockComponent
                block={block}
                rightLimit={rightNeighbor?.columnIndex}
                leftLimit={
                  leftNeighbor &&
                  leftNeighbor.columnIndex + leftNeighbor.columns
                }
              />
            </React.Fragment>
          );
        })}
        <GameOverView />
      </Matrix>

      <Row mt={2} width={matrixWidth}>
        {upcomingBlocks.map(block => (
          <View
            key={block.id}
            height={6}
            borderRadius={3}
            position="absolute"
            style={{
              transform: [{translateX: block.columnIndex * blockPixelSize + 1}],
              width: block.columns * blockPixelSize - 2,
            }}
            bgColor="gray"
          />
        ))}
      </Row>

      <Menu />
    </View>
  );
}
