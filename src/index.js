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

const withNewTaskIds = (column, taskIds) => ({
    id: column.id,
    title: column.title,
    taskIds,
  });


class InnerList extends React.PureComponent {
  render(){
    const {column, taskMap, index} = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId])
    return <Column column={column} tasks={tasks} index={index} selectedTaskIds={this.props.selectedTaskIds}/>  
  }
}

class App extends React.Component {
  constructor(props)
  {
    super(props)
    this.state = {
      dataState: initialData,
      selectedTaskIds: ['task-1','task-2'],
      draggingTaskId: null
    }
  }
  onDragStart = (start) => {
    document.body.style.color = 'orange';
    document.body.style.transition = 'background-color 0.2s ease';
    const draggableId = start.draggableId;
    const selected = this.state.selectedTaskIds.includes(draggableId)
    if(!selected){
      this.setState({
        selectedTaskIds: [],
      });
    }
    this.setState({
      draggingTaskId: draggableId
    });
  }

  onDragUpdate = update => {
    const {destination} = update;
    const opacity = destination ? destination.index / Object.keys(this.state.dataState.tasks).length : 0;
    document.body.style.color = `rgba(153,141,217, ${opacity})`;
  }

  getHomeColumn = (dataState, taskId) => {
    const columnId = this.state.dataState.columnOrder.find(id => {
      const column = this.state.dataState.columns[id];
      return column.taskIds.includes(taskId);
    });

    // invariant(columnId, 'Count not find column for task');
    console.log('Count not find column for task');
    return this.state.dataState.columns[columnId];
  };

  


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

    //condition to handle mulitple selections 
    if(this.state.selectedTaskIds.length > 1){
      const start = this.state.dataState.columns[source.droppableId];
      const dragged = start.taskIds[source.index];

      const insertAtIndex = (() => {
        const destinationIndexOffset = this.state.selectedTaskIds.reduce(
        (previous, current) => {
          if (current === dragged) {
            return previous;
          }
          const final = this.state.dataState.columns[destination.droppableId];
          const column = this.getHomeColumn(this.state.dataState, current);

          if (column !== final) {
            return previous;
          }

          const index = column.taskIds.indexOf(current);
          if (index >= destination.index) {
            return previous;
          }

           return previous + 1;
        }, 0)

        const result = destination.index - destinationIndexOffset;
        return result;
      })();

      const orderedSelectedTaskIds = [...this.state.selectedTaskIds];
      orderedSelectedTaskIds.sort((a, b) => {
        // moving the dragged item to the top of the list
        if (a === dragged) {
          return -1;
        }
        if (b === dragged) {
          return 1;
        }

         // sorting by their natural indexes
        const columnForA = this.getHomeColumn(this.state.dataState, a);
        const indexOfA = columnForA.taskIds.indexOf(a);
        const columnForB = this.getHomeColumn(this.state.dataState, b);
        const indexOfB = columnForB.taskIds.indexOf(b);

        if (indexOfA !== indexOfB) {
          return indexOfA - indexOfB;
        }

        // sorting by their order in the selectedTaskIds list
        return -1;
      });

      // we need to remove all of the selected tasks from their columns
      const withRemovedTasks = this.state.dataState.columnOrder.reduce(
        (previous: ColumnMap, columnId: Id): ColumnMap => {
          const column: Column = this.state.dataState.columns[columnId];

          // remove the id's of the items that are selected
          const remainingTaskIds = column.taskIds.filter(
            (id) => !this.state.selectedTaskIds.includes(id),
          );

          previous[column.id] = withNewTaskIds(column, remainingTaskIds);
          return previous;
        },
        this.state.dataState.columns,
      );

      const final: Column = withRemovedTasks[destination.droppableId];
      const withInserted = (() => {
        const base = [...final.taskIds];
        base.splice(insertAtIndex, 0, ...orderedSelectedTaskIds);
        return base;
      })();
          // insert all selected tasks into final column
      const withAddedTasks = {
        ...withRemovedTasks,
        [final.id]: withNewTaskIds(final, withInserted),
      };

      const updated = {
        ...this.state.dataState,
        columns: withAddedTasks,
      };

      this.setState({
        dataState: updated,
        selectedTaskIds: orderedSelectedTaskIds
      })
      // return {
      //   entities: updated,
      //   selectedTaskIds: orderedSelectedTaskIds,
      // };

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
              return <InnerList key={column.id} column={column} taskMap={this.state.dataState.tasks} index={index} selectedTaskIds={this.state.selectedTaskIds} />;
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
