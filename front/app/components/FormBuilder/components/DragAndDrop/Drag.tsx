import React, { memo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Draggable } from 'react-beautiful-dnd';

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
};

const Drag = memo(({ id, index, children }: DragProps) => {
  return (
    <Draggable draggableId={id} index={index} key={id}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div {...provided.dragHandleProps}>
              <Box
                border={
                  snapshot.isDragging ? `1px solid ${colors.teal}` : undefined
                }
              >
                {children}
              </Box>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
});

export default Drag;
