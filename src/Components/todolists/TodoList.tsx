import React, {useCallback, useRef, useState} from "react";
import TodoListTasks from '../tasks/TodoListTasks';
import TodoListTitle from "./TodoListTitle";
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {actions} from "../../redux/functionalReducer";
import {TaskType} from "../../redux/entities";
import styled from "styled-components/macro";
import {AppStateType} from "../../redux/store";
import {useHover} from "react-use-gesture";
import ContextButtons, {ButtonWrapper} from "./ContextButtons";
import isEqual from "react-fast-compare";
import {defaultPalette, neumorphColors} from "../neumorphColors";

const SingleListWrapper = styled.div`
  position: relative;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  backface-visibility: hidden;
  overflow: visible;
  padding: 25px;
  font-family: NunitoSans-Light;
  &:hover {
      z-index: 5;
  }
`;

const DetailsWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 100%;
  transform-origin: 50% 50%;
  transform: rotateZ(-90deg) translateY(-50%);
  transform-style: preserve-3d;
  font-size: 25px;
  white-space: nowrap;
`;

const SingleListBottomLayer = styled.div<{$palette: number, $editable: boolean, $closeLookState: boolean, $focusedStatus: boolean}>`
  border-radius: 30px;
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  padding: 25px;
  background: ${props => neumorphColors[props.$palette].concaveBackground};
  position: relative;
  transform: translateZ(0);
  transition: transform .6s cubic-bezier(0.25, 0, 0, 1);
  ${props => !props.$editable &&
    `&:hover {
        transform: translateZ(100px)
  }`}
  &:before {
      border-radius: 30px;
      content: "";
      position: absolute;
      top: 0;
      z-index: -1;
      bottom: 0;
      left: 0;
      right: 0;
      border: 5px solid transparent;
      transition: border, opacity .3s linear;
      box-shadow: ${props => neumorphColors[props.$palette].shadows};
      opacity: ${props => props.$closeLookState ? 1 : 0};
  };
  &:hover:before {
      border: 5px solid ${props => neumorphColors[props.$palette].background};
      ${props => props.$editable && 'opacity: 1'}
  };
  &:after {
      border-radius: 30px;
      content: "";
      position: absolute;
      top: 0;
      z-index: -1;
      bottom: 0;
      left: 0;
      right: 0;
      box-shadow: 20px 20px 40px rgba(0, 0, 0, .4);
      transition: opacity .3s linear;
      opacity: ${props => !props.$closeLookState ? 1 : 0};
  };
  ${props => props.$editable && '&:hover:after {opacity: 0}'}
  ${props => props.$editable && !props.$focusedStatus &&
    `&:hover ${ButtonWrapper},  ${ButtonWrapper}:focus-within {
       width: 90px;
       height: 90px;
       opacity: 1;
       transition: opacity .6s cubic-bezier(0.25, 0, 0, 1);
    };`
  }
`;


type PropsType = {
    id: string,
    listTitle: string,
    listTasks?: TaskType[],
    paletteIndex: number,
    setNewHeights: (height: number, id: string) => void,
    deleteList: (id: string) => void,
    closeLook: boolean
};

const TodoList: React.FC<PropsType> = ({
                                           id, listTitle, listTasks, paletteIndex,
                                           setNewHeights, deleteList, closeLook
                                       }) => {

    const dispatch = useDispatch();
    const editable = useSelector((state: AppStateType) => state.todoList.editable, shallowEqual);
    const focusedStatus = useSelector((state: AppStateType) => state.todoList.focusedStatus, shallowEqual);

    const currHeight = useRef<number>(0);
    const ref = useRef<HTMLDivElement>(null);
    const setHeight = useCallback((height: number) => {
        if (currHeight.current === 0 && ref.current) {
            currHeight.current = ref.current.offsetHeight
        }
        if (currHeight.current !== height) {
            setNewHeights(height+currHeight.current, id);
        }
    }, []);


    const [filterValue, setFilterValue] = useState<string>('All');

    const changeFilter = (newFilterValue: string) => {
        setFilterValue(newFilterValue)
    };


    const addTask = () => {
        const taskId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, (c, r) => ('x' == c ? (Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16));
        const newTask = {
            title: '',
            id: taskId,
            todoListId: id,
        }
        dispatch(actions.addTask(newTask, id));
    };

    const deleteTodoList = useCallback(() => {
        deleteList(id)
        dispatch(actions.deleteTodoList(id))
    }, []);

    const tasks = listTasks ? listTasks.filter(t => {
        if (filterValue === "All") {
            return true;
        }
        if (filterValue === "Active") {
            return t.status === 0;
        }
        if (filterValue === "Completed") {
            return t.status === 2;
        }
    }) : [];

    //hover Effect

    const bind = useHover(({hovering}) => {
        if (hovering) {
            dispatch(actions.setPalette(neumorphColors[paletteIndex]));
        }
        if (!hovering) {
            dispatch(actions.setPalette(defaultPalette));
        }
    });

    //close look animations

    const [isTitleEditable, setTitleEditMode] = useState<boolean>(false);
    const switchTitleMode = useCallback(() => {
        setTitleEditMode(!isTitleEditable)
    }, [isTitleEditable]);

    /*console.log(`${listTitle} render`)*/
    return (
        <SingleListWrapper {...!closeLook && {...bind()}} ref={ref}>
            <SingleListBottomLayer $palette={paletteIndex} $editable={editable}
                                   $closeLookState={closeLook} $focusedStatus={focusedStatus}>
                <ContextButtons colors={neumorphColors[paletteIndex]} deleteTodoList={deleteTodoList}
                                addTask={addTask} editList={switchTitleMode}/>
                <TodoListTitle listTitle={listTitle} id={id} isTitleEditable={isTitleEditable} deleteTodoList={deleteTodoList}
                               switchTitleMode={switchTitleMode} palette={neumorphColors[paletteIndex]}/>
                <TodoListTasks todoListId={id} tasks={tasks} setHeight={setHeight} palette={neumorphColors[paletteIndex]}/>
                {/* <TodoListFooter filterValue={filterValue} changeFilter={changeFilter}/>*/}
                {/*<DetailsWrapper>
                    more details...
                </DetailsWrapper>*/}
            </SingleListBottomLayer>
        </SingleListWrapper>
    );
}

export default React.memo(TodoList, isEqual);
