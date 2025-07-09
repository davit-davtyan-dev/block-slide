import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Row, Text, TouchableOpacity, View} from './components';
import Matrix from './Matrix';
import BlockComponent from './Block';
import SideMenu from './components/SideMenu';
import GameOverView from './GameOverView';
import {useGameContext} from './contexts/GameContext';
import {useTheme} from './contexts/ThemeContext';
import {useSizes} from './contexts/SizesContext';
import type {Block} from './types';

export default function GameScreen() {
  const {blockPixelSize, matrixWidth} = useSizes();
  const {blocks, restart} = useGameContext();
  const {theme} = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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
      <View position="absolute" top={8} left={8}>
        <TouchableOpacity p={4} onPress={() => setIsMenuVisible(true)}>
          <Icon name="menu" size={24} color={theme.mainColor} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        mt={8}
        py={2}
        px={8}
        onPress={restart}
        borderWidth={1}
        borderRadius={8}
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

      <Row position="relative" marginTop={6} width={matrixWidth}>
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

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </View>
  );
}
