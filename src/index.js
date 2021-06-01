import React from 'react';
import ReactDOM from 'react-dom';
// import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';


const Container = styled.div`
  display: flex;
`;


class InnerList extends React.PureComponent {
  render(){
    const {column, taskMap, index} = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId])
    return <Column column={column} tasks={tasks} index={index}/>  
  }
}

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
    const {destination, source, draggableId, type } = result;
    if(!destination){
      return;
    }
    if(
      destination.droppableId === source.droppableId && destination.index === source.index 
    ){
      return ; 
    }

    if(type === 'column')
    {
      const newColumnOrder = Array.from(this.state.dataState.columnOrder)
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      const newState = {
        ...this.state.dataState,
        columnOrder: newColumnOrder
      }
      this.setState({
        dataState: newState
      })
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
        <Droppable 
          droppableId="all-columns" 
          direction="horizontal" 
          type="column"
          >
          {provided => (
            <Container
              {...provided.droppableProps}
              innerRef={provided.innerRef}
              
            >
            {this.state.dataState.columnOrder.map((columnId, index) => {
              const column = this.state.dataState.columns[columnId];
              return <InnerList key={column.id} column={column} taskMap={this.state.dataState.tasks} index={index} />;
            })}
            {provided.placeholder}
            </Container>
          )}
          
        </Droppable>
      </DragDropContext>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
