import React, { memo } from 'react';

import { Droppable } from 'react-beautiful-dnd';

type DropProps = {
  id: string;
  type: string;
  children: React.ReactNode;
};

const Drop = memo(({ id, type, ...props }: DropProps) => {
  return (
    <Droppable droppableId={id} type={type}>
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps} {...props}>
            {props.children}
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
});

export default Drop;
