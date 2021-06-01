import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => props.isDragDisabled ? 'lightgrey' : (props.isDragging ? 'lightgreen' : 'white')};
  display: flex;
`;

const Handle = styled.div`
  width: 20px;
  heigth: 20px;
  background-color: ${props => props.selected ? 'orange' : 'green' }
  border-radius: 4px;
  margin-right: 8px;
`;

export default class Task extends React.Component {
  render() {
    console.log(this.props.selected)
    const isDragDisabled = false
    return (
      <Draggable 
      draggableId={this.props.task.id} 
      index={this.props.index}
      >
        {(provided, snapshot )=> (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            innerRef={provided.innerRef}
            isDragging={snapshot.isDragging}
            isDragDisabled={isDragDisabled}
          >
            <Handle {...provided.dragHandleProps} selected={this.props.selected} />
            {this.props.task.content}
          </Container>
        )}
      </Draggable>
    );
  }
}
