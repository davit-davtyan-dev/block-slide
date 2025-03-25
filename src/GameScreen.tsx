import React from 'react';
import {Text, TouchableOpacity, View} from './components';
import Matrix from './Matrix';
import BlocksRow from './BlocksRow';
import Block from './Block';
import {useGameContext} from './contexts/GameContext';
import {useTheme} from './contexts/ThemeContext';

export default function GameScreen() {
  const {rows, restart} = useGameContext();
  const {theme} = useTheme();

  return (
    <View center h="100%" bgColor={theme.backgroundColor}>
      <TouchableOpacity
        mt={8}
        py={2}
        px={8}
        onPress={restart}
        borderWidth={1}
        borderRadius={8}
        borderColor="white">
        <Text color="white">Restart</Text>
      </TouchableOpacity>
      <Matrix>
        {rows.map((rowBlocks, rowIndex) => (
          <BlocksRow key={rowIndex} index={rowIndex}>
            {rowBlocks.map((block, index) => {
              const blockToTheRight = rowBlocks[index + 1];
              const blockToTheLeft = rowBlocks[index - 1];

              return (
                <Block
                  block={block}
                  key={block.id}
                  rightLimit={blockToTheRight?.startIndex}
                  leftLimit={
                    blockToTheLeft &&
                    blockToTheLeft.startIndex + blockToTheLeft.columns
                  }
                />
              );
            })}
          </BlocksRow>
        ))}
      </Matrix>
    </View>
  );
}
