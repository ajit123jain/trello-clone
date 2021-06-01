import React from 'react';
import ReactDOM from 'react-dom';
// import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';


const Container = styled.div`
  display: flex;
`;

class App extends React.Component {
  constructor(props)
  {
    super(props)
    this.state = {
      dataState: initialData
    }
  }
  onDragStart = () => {
    document.body.style.color = 'orange';
    document.body.style.transition = 'background-color 0.2s ease';
  }

  onDragUpdate = update => {
    const {destination} = update;
    const opacity = destination ? destination.index / Object.keys(this.state.dataState.tasks).length : 0;
    document.body.style.color = `rgba(153,141,217, ${opacity})`;
  }

  onDragEnd = result => {
    document.body.style.color = 'inherit';
    document.body.style.backgroundColor = 'inherit';
    // TODO: reorder our column
    const {destination, source, draggableId } = result;
    if(!destination){
      return;
    }
    if(
      destination.droppableId === source.droppableId && destination.index === source.index 
    ){
      return ; 
    }

    const start = this.state.dataState.columns[source.droppableId];
    const finish = this.state.dataState.columns[destination.droppableId];
    if(start == finish){
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index,1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start, 
        taskIds: newTaskIds
      }
      const newState = {
        ...this.state.dataState, 
        columns: {
          ...this.state.dataState.columns,
          [newColumn.id]: newColumn
        }
      }
      this.setState({
        dataState: newState
      })
      return ;
    }

    // Moving from onelist to another 
    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start, 
      taskIds: startTaskIds
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish, 
      taskIds: finishTaskIds
    }

    const newState = {
      ...this.state.dataState, 
      columns: {
        ...this.state.dataState.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    }
    this.setState({
      dataState: newState
    })
  };

  render() {
    return (
      <DragDropContext 
      onDragStart={this.onDragStart}
      onDragUpdate={this.onDragUpdate}
      onDragEnd={this.onDragEnd}
      >
        <Container>
        {this.state.dataState.columnOrder.map(columnId => {
          const column = this.state.dataState.columns[columnId];
          const tasks = column.taskIds.map(taskId => this.state.dataState.tasks[taskId]);
          return <Column key={column.id} column={column} tasks={tasks} />;
        })}
        </Container>
      </DragDropContext>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
