import React from 'react';
import {Row} from './components';
import {useSizes} from './contexts/SizesContext';

interface BlocksRowProps {
  index: number;
  children: React.ReactNode;
}

export default function BlocksRow(props: BlocksRowProps) {
  const {blockPixelSize} = useSizes();

  return (
    <Row position="absolute" bottom={blockPixelSize * (props.index + 1)}>
      {props.children}
    </Row>
  );
}
