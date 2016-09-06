import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {connect, Provider} from 'react-redux';

const todoReducer = (state={}, action) =>{
  switch(action.type){
    case 'ADD_TODO':
      return {
        text: action.text,
        id: action.id,
        completed: false
      };
    case 'TOGGLE_TODO':
      return {...state,
             completed: !state.completed};
    default:
      return state;
  }
};

const todosReducer = (state=[], action) => {
  switch(action.type){
    case 'ADD_TODO':
      return[...state, todoReducer({},action)];
    case 'TOGGLE_TODO':
      return state.map((item)=>{
        if(item.id == action.id){
          return todoReducer(item, action);
        }else{
          return item;
        }
      });
    default:
      return state;
  }
};

const filterReducer = (state='SHOW_ALL', action)=>{
  switch(action.type){
    case 'SET_VISIBLITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const todoAppReducer = combineReducers({
  todos:todosReducer,
  filter:filterReducer
});

const Todo = ({
  text,
  completed,
  onClick
}) => {
  return (
    <li onClick={onClick}
      style={{textDecoration:completed?'line-through':'none'}}
    >{text}</li>
  );
};

const TodoList = ({
  todos,
  onTodoClick
}) =>{
  return (
    <ul>
    {todos.map(todo=><Todo key={todo.id} {...todo} onClick={()=>onTodoClick(todo.id)}/>)}
    </ul>
  );
};

let nextTodoId = 0;
const addTodoAction = (text) =>{
  return {
    type:'ADD_TODO',
    text:text,
    id: nextTodoId++
  };
};
let AddToDo = ({dispatch})=>{
  let input;
  return (
    <p>
      <input type="text" ref={(node)=>{input = node}}/>
      <button onClick={()=>dispatch(addTodoAction(input.value))}>Add Todo</button>
    </p>
  );
};
AddToDo = connect()(AddToDo);

const Link = ({
  active,
  children,
  onFilterClick
})=>{
  return (
    active?
    <span>{children}</span>:
    <a href="#" onClick={(e)=>{
      e.preventDefault();
      onFilterClick();
    }}
    style={{padding:'0 5px'}}
    >{children}</a>
  );
};

const setVisibilityFilterAction = (filter)=>{
  return {
    type:'SET_VISIBLITY_FILTER',
    filter
  };
};
const FilterLink = connect(
  (state, ownProps)=>{return {active:ownProps.filter == state.filter}},
  (dispatch,ownProps)=>{return{onFilterClick:()=>dispatch(setVisibilityFilterAction(ownProps.filter))}},
)(Link);

const Footer = ()=>{
  return (
    <p>
      <FilterLink filter="SHOW_ALL">ALL</FilterLink>
      <FilterLink filter="SHOW_ACTIVE">ACTIVE</FilterLink>
      <FilterLink filter="SHOW_COMPLETED">COMPLETED</FilterLink>
    </p>
  );
};

const getVisibleTodos = (todos, filter)=>{
  return todos.filter(todo=>{
    if(filter == 'SHOW_ALL') return true;
    else{
      return filter == 'SHOW_ACTIVE' ? !todo.completed : todo.completed;
    }
  });
};

const todoClickAction = (id) => {
  return {
    type:'TOGGLE_TODO',
    id:id
  };
};
const VisableTodos = connect(
  (state)=>{return {todos:getVisibleTodos(state.todos, state.filter)}},
  (dispatch)=>{return {onTodoClick:id=>dispatch(todoClickAction(id))}}
)(TodoList);

class TodoApp extends Component{
  render(){
    return (
      <div>
        <AddToDo />
        <VisableTodos />
        <Footer />
      </div>
    );
  }
}
ReactDOM.render(
  <Provider store={createStore(todoAppReducer)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);
