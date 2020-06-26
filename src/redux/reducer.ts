import {api} from "./api";
import {TaskType, TodoListType} from "./entities";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {AppStateType, InferActionTypes} from "./store";
import cloneDeep from "lodash-es/cloneDeep";
import {movePos} from "../hooks/movePos";
import {swap} from "../hooks/swap";

type InitialStateType = {
    todoLists: Array<TodoListType>,
    deepCopy: Array<TodoListType>,
    editable: boolean,
    deletedLists: Array<string>,
    addedLists: Array<TodoListType>,
    changedLists: Array<TodoListType>,
    deletedTasks: Array<{ todoListId: string, taskId: string }>,
    changedTasks: Array<TaskType>,
    addedTasks: Array<TaskType>,
    deletedTasksWithList: Array<{ todoListId: string, taskId: string }>,
    listsOrder: Array<string>,
    tasksOrder: Array<{ todoListId: string, newTasksOrder: Array<string> }>,
    newListsId: Array<{ oldId: string, newId: string }>,
    newTasksId: Array<{ oldId: string, newId: string, todoListId: string }>,
    errorsNumber: number,
    backgroundImage: string,
    focusedStatus: boolean
};

const initialState = {
    todoLists: [],
    deepCopy: [],
    editable: false,
    deletedLists: [],
    addedLists: [],
    changedLists: [],
    deletedTasks: [],
    changedTasks: [],
    addedTasks: [],
    deletedTasksWithList: [],
    listsOrder: [],
    tasksOrder: [],
    newListsId: [],
    newTasksId: [],
    errorsNumber: 0,
    backgroundImage: `linear-gradient(135deg, #D7E1EC 0%, #FFFFFF 100%)`,
    focusedStatus: false
};

const reducer = (state: InitialStateType = initialState, action: ActionsTypes): InitialStateType => {
    switch (action.type) {
        case 'reducer/SET_TODO_LISTS':
            return {
                ...state,
                todoLists: action.todoLists
            };
        case 'reducer/SET_TASKS':
            return {
                ...state,
                todoLists: state.todoLists.map(list => {
                    if (list.id === action.todoListId) {
                        return {...list, tasks: action.tasks}
                    } else return list
                }),
            };
        case 'reducer/ADD_TODO_LIST':
            return {
                ...state,
                todoLists: [action.newTodoList, ...state.todoLists],
              /*  addedLists: [action.newTodoList, ...state.addedLists]*/
            };
        case 'reducer/ADD_TASK':
            return {
                ...state,
                todoLists: state.todoLists.map(list => {
                    if (list.id === action.todoListId) {
                        return {...list, tasks: [ action.newTask, ...list.tasks]}
                    } else return list
                }),
           /*     addedTasks: [...state.addedTasks]*/
            };
        case 'reducer/CHANGE_TASK':
           /* const indexOfTask = state.changedTasks.findIndex(item => item.id === action.task.id);
            const newTasksArray = indexOfTask === -1 ? [...state.changedTasks, action.task]
                : state.changedTasks.map((item, i) => {
                    if (i === indexOfTask) return action.task;
                    return item
                });*/
            return {
                ...state,
                todoLists: state.todoLists.map(list => {
                    if (list.id === action.task.todoListId) {
                        return {
                            ...list, tasks: list.tasks.map(task => {
                                if (task.id === action.task.id) {
                                    return {...action.task}
                                } else return task;
                            })
                        }
                    } else return list
                }),
               /* changedTasks: [...newTasksArray]*/
            };
        case 'reducer/DELETE_TODO_LIST':
            return {
                ...state,
                todoLists: state.todoLists.filter(list => list.id !== action.todoListId),
               /* deletedLists: [...state.deletedLists, action.todoListId],
                deletedTasksWithList: [...state.deletedTasksWithList, ...state.todoLists
                    .find(item => item.id === action.todoListId)!.tasks
                    .map(item => ({todoListId: item.todoListId, taskId: item.id}))]*/
            };
        case 'reducer/DELETE_TASK':
            return {
                ...state,
                todoLists: state.todoLists.map(list => {
                    if (list.id === action.todoListId) {
                        return {...list, tasks: list.tasks.filter(task => task.id !== action.taskId)}
                    } else return list
                }),
              /*  deletedTasks: [...state.deletedTasks, {todoListId: action.todoListId, taskId: action.taskId}]*/
            };
        case 'reducer/CHANGE_TODO_LIST_TITLE':
            /*const listIndex = state.changedLists.findIndex(item => item.id === action.todoListId);
            const newListsArray = listIndex === -1 ? [...state.changedLists, {
                    id: action.todoListId, title: action.todoListTitle, tasks: []
                }]
                : state.changedLists.map((item, i) => {
                    if (i === listIndex) return {id: action.todoListId, title: action.todoListTitle, tasks: []};
                    return item
                });*/
            return {
                ...state,
                todoLists: state.todoLists.map(list => {
                    if (list.id === action.todoListId) {
                        return {...list, title: action.todoListTitle}
                    } else return list
                }),
               /* changedLists: [...newListsArray]*/
            };
        case "reducer/SWAP_TODO_LISTS":
            return {
                ...state,
                listsOrder: action.newListsOrder
            }
        case "reducer/SWAP_TASKS":
            /*const listPosition = state.tasksOrder.findIndex(item => item.todoListId === action.todoListId)
            const newSwappedTasks = listPosition === -1 ? [...state.swappedTasks, {
                todoListId: action.todoListId,
                swappedTasks: [action.swappedTasks]
            }] : state.swappedTasks.map((item, i) => {
                if (i === listPosition) return {
                    todoListId: item.todoListId,
                    swappedTasks: item.swappedTasks.map(tasks => tasks[0] === action.swappedTasks[0] ? action.swappedTasks : tasks)
                }
                return item
            })*/
            const index = state.tasksOrder.findIndex(item => item.todoListId === action.todoListId);
            const newSwappedTasks = index !== -1 ? state.tasksOrder.map((item, i) => {
                if (i === index) return {todoListId: action.todoListId, newTasksOrder: action.newTasksOrder}
                return item
            }) : [...state.tasksOrder, {todoListId: action.todoListId, newTasksOrder: action.newTasksOrder}]
            return {
                ...state,
                tasksOrder: newSwappedTasks
            }
        case "reducer/ENABLE_EDIT_MODE":
            return {
                ...state,
                editable: true,
                deletedLists: [],
                addedLists: [],
                changedLists: [],
                deletedTasks: [],
                changedTasks: [],
                addedTasks: [],
                listsOrder: [],
                tasksOrder: [],
                deletedTasksWithList: [],
                errorsNumber: 0,
                deepCopy: cloneDeep(state.todoLists)
            };
        case "reducer/DISABLE_EDIT_MODE":
            return {
                ...state,
                editable: false
            }
        case "reducer/SET_ERROR":
            return {
                ...state,
                errorsNumber: state.errorsNumber + 1
            };
        case "reducer/SET_BACKGROUND":
            return {
                ...state,
                backgroundImage: action.background
            };
        case "reducer/SET_FOCUSED_STATUS":
            return {
                ...state,
                focusedStatus: action.status
            };
        case "reducer/SET_NEW_ID":
            return {
                ...state,
                todoLists: action.newTodoLists
            };
        case "reducer/SET_NEW_LISTS_ID":
            return {
                ...state,
                newListsId: action.newListsId
            }
        case "reducer/SET_NEW_TASKS_ID":
            return {
                ...state,
                newTasksId: action.newTasksId
            }
        default:
            return state;
    }
};

type ActionsTypes = InferActionTypes<typeof actions>;

export const actions = {
    addTodoList: (newTodoList: TodoListType) => ({type: 'reducer/ADD_TODO_LIST', newTodoList} as const),
    addTask: (newTask: TaskType, todoListId: string) => ({type: 'reducer/ADD_TASK', newTask, todoListId} as const),
    changeTask: (task: TaskType) => ({type: 'reducer/CHANGE_TASK', task} as const),
    deleteTodoList: (todoListId: string) => ({type: 'reducer/DELETE_TODO_LIST', todoListId} as const),
    deleteTask: (todoListId: string, taskId: string) => ({type: 'reducer/DELETE_TASK', taskId, todoListId} as const),
    restoreTodoList: (todoLists: TodoListType[]) => ({type: 'reducer/SET_TODO_LISTS', todoLists} as const),
    restoreTasks: (tasks: TaskType[], todoListId: string) => ({
        type: 'reducer/SET_TASKS',
        tasks,
        todoListId
    } as const),
    changeTodoListTitle: (todoListId: string, todoListTitle: string) => ({
        type: 'reducer/CHANGE_TODO_LIST_TITLE',
        todoListId,
        todoListTitle
    } as const),
    enableEditMode: () => ({type: 'reducer/ENABLE_EDIT_MODE'} as const),
    disableEditMode: () => ({type: 'reducer/DISABLE_EDIT_MODE'} as const),
    setError: () => ({type: 'reducer/SET_ERROR'} as const),
    setBackground: (background: string) => ({type: 'reducer/SET_BACKGROUND', background} as const),
    setFocusedStatus: (status: boolean) => ({type: 'reducer/SET_FOCUSED_STATUS', status} as const),
    swapTasks: (todoListId: string, newTasksOrder: Array<string>) => ({
        type: 'reducer/SWAP_TASKS', todoListId, newTasksOrder
    } as const),
    swapTodoLists: (newListsOrder: Array<string>) => ({type: 'reducer/SWAP_TODO_LISTS', newListsOrder} as const),
    setTodoListsWithNewId: (newTodoLists: Array<TodoListType>) => ({type: 'reducer/SET_NEW_ID', newTodoLists} as const),
    setNewListsId: (newListsId: Array<{ oldId: string, newId: string }>) => ({
        type: 'reducer/SET_NEW_LISTS_ID', newListsId
    } as const),
    setNewTasksId: (newTasksId: Array<{ oldId: string, newId: string, todoListId: string }>) => ({
        type: 'reducer/SET_NEW_TASKS_ID', newTasksId
    } as const),
}

type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsTypes>;
type ThunkActionType = ThunkDispatch<AppStateType, unknown, ActionsTypes>;

export const loadTodoListsTC = (): ThunkType => (dispatch: ThunkActionType) => {
    api.restoreState().then(data => {
        dispatch(actions.restoreTodoList(data))
    })
};
export const addTodoListTC = (title: string): ThunkType => (dispatch: ThunkActionType) => {//done
    api.addTodoList(title).then(data => {
        if (data.resultCode === 0) dispatch(actions.addTodoList(data.data.item))
    })
};
export const addTaskTC = (newTask: string, todoListId: string): ThunkType => (dispatch: ThunkActionType) => {
    api.addTask(newTask, todoListId).then(data => {
        if (data.resultCode === 0) dispatch(actions.addTask(data.data.item, todoListId))
    })
};
export const changeTaskTC = (todoListId: string, taskId: string, newTask: TaskType): ThunkType => (dispatch: ThunkActionType) => {
    api.changeTask(todoListId, taskId, newTask).then(data => {
        if (data.resultCode === 0) dispatch(actions.changeTask(data.data.item))
    })
};
export const deleteTodoListTC = (todoListId: string): ThunkType => (dispatch: ThunkActionType) => {
    api.deleteTodoList(todoListId).then(data => {
        if (data.resultCode === 0) dispatch(actions.deleteTodoList(todoListId))
    })
};
export const deleteTaskTC = (todoListId: string, taskId: string): ThunkType => (dispatch: ThunkActionType) => {
    api.deleteTask(todoListId, taskId).then(data => {
        if (data.resultCode === 0) dispatch(actions.deleteTask(todoListId, taskId))
    })
};
export const restoreTasksTC = (todoListId: string): ThunkType => (dispatch: ThunkActionType) => {
    api.restoreTasks(todoListId).then(data => {
        dispatch(actions.restoreTasks(data.items, todoListId))
    })
};
export const changeTodoListTitleTC = (todoListId: string, todoListTitle: string): ThunkType => (dispatch: ThunkActionType) => {
    api.changeTodoListTitle(todoListId, todoListTitle).then(data => {
        if (data.resultCode === 0) dispatch(actions.changeTodoListTitle(todoListId, todoListTitle))
    })
};

/*export const submitAllChanges = (): ThunkType =>
    async (dispatch: ThunkActionType, getState: () => AppStateType) => {
        const deletedLists = getState().todoList.deletedLists;
        const addedLists = getState().todoList.addedLists;
        const clearedAddedLists = getState().todoList.addedLists.filter(item => deletedLists
            .findIndex(i => i === item.id) === -1);
        const changedLists = getState().todoList.changedLists.filter(item => deletedLists
            .findIndex(i => i === item.id) === -1);
        const clearlyDeletedLists = deletedLists.filter(list => addedLists
            .findIndex(item => item.id === list) === -1);
        /!*const addedSwappedLists = getState().todoList.swappedLists.filter(item => clearedAddedLists
            .findIndex(i => i.id === (item[0].id || item[1].id)) !== -1);
        const clearlySwappedLists = getState().todoList.swappedLists.filter(item => addedSwappedLists
            .findIndex(i => i[0] === item[0] && i[1] === item[1]) === -1);*!/

        const deletedTasksWithList = getState().todoList.deletedTasksWithList;
        const deletedTasks = getState().todoList.deletedTasks.filter(item => deletedTasksWithList
            .findIndex(i => i.taskId === item.taskId) === -1);
        const allDeletedTasks = [...deletedTasks, ...deletedTasksWithList];
        const changedTasks = getState().todoList.changedTasks.filter(item => allDeletedTasks
            .findIndex(i => i.taskId === item.id) === -1);
        const addedTasks = getState().todoList.addedTasks.filter(item => allDeletedTasks
            .findIndex(i => i.taskId === item.id) === -1);
        const clearedSwappedTasks = getState().todoList.swappedTasks.filter(item => deletedLists
            .findIndex(i => i === item.todoListId) === -1).map(item => item.swappedTasks
            .map(taskArray => [...taskArray, item.todoListId])).map(item => {
            const newArray: Array<string> = [];
            return newArray.concat(...item)
        })
        //очистка от удалённых

        const clearlyAddedLists = clearedAddedLists.map(list => {
            const sameList = changedLists.find(item => item.id === list.id);
            if (sameList) {
                return sameList
            } else return list
        });
        const clearlyChangedLists = changedLists.filter(list => clearlyAddedLists
            .findIndex(item => item.id === list.id) === -1);
        //очистка одинаковых листов

        const clearedNewTasks = addedTasks.map(task => {
            const sameTask = changedTasks.find(item => item.id === task.id)
            if (sameTask) {
                return sameTask
            } else return task
        });
        const clearlyChangedTasks = changedTasks.filter(task => clearedNewTasks
            .findIndex(item => item.id === task.id) === -1);
        const addedInNewListsTasks = clearedNewTasks.filter(task => clearlyAddedLists
            .findIndex(list => list.id === task.todoListId) !== -1);
        const clearlyAddedTasks = clearedNewTasks.filter(task => addedInNewListsTasks
            .findIndex(item => item.id === task.id) !== 1);
        const addedSwappedTasks = clearedSwappedTasks.map(item => item.filter(task =>
            clearlyAddedTasks.findIndex(i => i.id === task) !== -1));
        const addedInNewListsSwappedTasks = clearedSwappedTasks.map(item => item.filter(task =>
            addedInNewListsTasks.findIndex(i => i.id === task) !== -1));
        const clearlySwappedTasks = clearedSwappedTasks.map(item => item.filter(task => (
            addedSwappedTasks.findIndex(i => (i[0] || i[1]) === task) === -1 || addedInNewListsSwappedTasks
                .findIndex(i => (i[0] || i[1]) === task) === -1)));
        //очистка тасок

        //запросы
        if (clearlyAddedLists.length !== 0) {
            let newLists: Array<{ newId: string, oldId: string }> = [];
            const promises = clearlyAddedLists.map(async (list) => {
                return await api.addTodoList(list.title).then(data => {
                    if (data.resultCode === 0) newLists.push({newId: data.data.item.id, oldId: list.id})
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
            await Promise.all(promises);
            if (addedInNewListsTasks.length !== 0) {
                let newTasks: Array<{ newId: string, oldId: string, listId: string }> = [];
                const promises = addedInNewListsTasks.map(async (task) => {
                    let newListId = newLists.find(list => list.oldId === task.todoListId)!.newId;
                    return await api.addTask(task.title, newListId).then(data => {
                        if (data.resultCode === 0) newTasks.push({
                            newId: data.data.item.id,
                            oldId: task.id,
                            listId: data.data.item.todoListId
                        })
                        if (data.resultCode !== 0) dispatch(actions.setError())
                    })
                })
                await Promise.all(promises);
                if (addedInNewListsSwappedTasks.length !== 0) {
                    const newIdSwappedTasks = addedInNewListsSwappedTasks.map(tasks => tasks.map(task => {
                        const currentTask = newTasks.find(newTask => task === newTask.oldId)!;
                        return {newId: currentTask.newId, listId: currentTask.listId}
                    }))
                    newIdSwappedTasks.map(tasks => {
                        api.swapTasks(tasks[0].listId, tasks[0].newId, tasks[1].newId)
                    })
                }
            }
        }
        if (clearlyAddedTasks.length !== 0) {
            let newTasks: Array<{ newId: string, oldId: string, listId: string }> = [];
            const promises = clearlyAddedTasks.map(async (task) => {
                api.addTask(task.title, task.todoListId).then(data => {
                    if (data.resultCode === 0) newTasks.push({
                        newId: data.data.item.id,
                        oldId: task.id,
                        listId: data.data.item.todoListId
                    })
                    if (data.resultCode !== 0) dispatch(actions.setError())
                });
            })
            await Promise.all(promises);
            if (addedSwappedTasks.length !== 0) {
                const newIdSwappedTasks = addedSwappedTasks.map(tasks => tasks.map(task => {
                    const currentTask = newTasks.find(newTask => task === newTask.oldId)!;
                    return {newId: currentTask.newId, listId: currentTask.listId}
                }))
                newIdSwappedTasks.map(tasks => {
                    api.swapTasks(tasks[0].listId, tasks[0].newId, tasks[1].newId).then(data => {
                        if (data.resultCode !== 0) dispatch(actions.setError())
                    })
                })
            }
        }
        if (clearlySwappedTasks.length !== 0) {
            clearlySwappedTasks.forEach(tasks => {
                api.swapTasks(tasks[2], tasks[0], tasks[1]).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (clearlyDeletedLists.length !== 0) {
            clearlyDeletedLists.forEach(list => {
                api.deleteTodoList(list).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (clearlyChangedLists.length !== 0) {
            clearlyChangedLists.forEach(list => {
                api.changeTodoListTitle(list.id, list.title).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (clearlyChangedTasks.length !== 0) {
            clearlyChangedTasks.forEach(task => {
                api.changeTask(task.todoListId, task.id, task).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (deletedTasks.length !== 0) {
            deletedTasks.forEach(task => {
                api.deleteTask(task.todoListId, task.taskId).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        dispatch(actions.disableEditMode())
    };*/

export const submitAllChanges = (): ThunkType =>
    async (dispatch: ThunkActionType, getState: () => AppStateType) => {
        const oldTodoLists = getState().todoList.deepCopy;
        const newTodoLists = getState().todoList.todoLists;
        let listsOrder = getState().todoList.listsOrder;
        let tasksOrder = getState().todoList.tasksOrder;

        const newListsId: Array<{ oldId: string, newId: string }> = [];
        const newTasksId: Array<{ oldId: string, newId: string, todoListId: string }> = [];
        let todoListsWithNewId: Array<TodoListType> = [];

        //added items
        const addedLists = newTodoLists.filter(list => oldTodoLists.findIndex(oldList => oldList.id === list.id) === -1);
        const deletedLists = oldTodoLists.filter(list => newTodoLists.findIndex(newList => newList.id === list.id) === -1);
        const editedLists: Array<TodoListType> = []
        newTodoLists.map(list => {
            const oldList = oldTodoLists.find(oldList => oldList.id === list.id);
            if (oldList && list.title !== oldList.title) {
                editedLists.push(list)
            }
        })

        let addedTasks: Array<TaskType> = [];
        const editedTasks: Array<TaskType> = [];
        newTodoLists.map(list => {
            const oldList = oldTodoLists.find(oldList => oldList.id === list.id);
            if (oldList) {
                list.tasks.map(task => {
                    const oldTask = oldList.tasks.find(oldTask => oldTask.id === task.id)
                    if (!oldTask) {
                        addedTasks.push(task);
                        return
                    }
                    if (oldTask && oldTask.title !== task.title) {
                        editedTasks.push(task)
                    }
                })
            }
            if (!oldList && list.tasks.length !== 0) {
                list.tasks.map(task => addedTasks.push(task))
            }
        })
        const deletedTasks: Array<TaskType> = [];
        oldTodoLists.map(list => {
            const newList = newTodoLists.find(newList => newList.id === list.id);
            if (newList) {
                list.tasks.map(task => {
                    const newTask = newList.tasks.find(newTask => newTask.id === task.id)
                    if (!newTask) {
                        deletedTasks.push(task)
                    }
                })
            }
        })

        const createAndChangeIdOfTasksInOrderList = async () => {
            if (addedTasks.length !== 0) {
                const tasksPromises = addedTasks.map(async (task) => {
                    api.addTask(task.title, task.todoListId).then(data => {
                        if (data.resultCode === 0) newTasksId.push({
                            newId: data.data.item.id,
                            oldId: task.id,
                            todoListId: data.data.item.todoListId
                        })
                        if (data.resultCode !== 0) dispatch(actions.setError())
                    });
                })
                await Promise.all(tasksPromises);
                if (tasksOrder.length !== 0) {
                    tasksOrder = tasksOrder.map(item => {
                        const newList = newListsId.find(list => list.oldId === item.todoListId)
                        const tasksWithNewId = item.newTasksOrder.map(taskId => {
                            const newTask = newTasksId.find(newTask => newTask.oldId === taskId);
                            if (newTask) return newTask.newId;
                            return taskId
                        })
                        return {todoListId: newList ? newList.newId : item.todoListId, newTasksOrder: tasksWithNewId}
                    })
                }
            }
        }

        //запросы, добавить последовательность вызова
        if (addedLists.length !== 0) {
            const listPromises = addedLists.map(async (list) => {
                return await api.addTodoList(list.title).then(data => {
                    if (data.resultCode === 0) newListsId.push({newId: data.data.item.id, oldId: list.id})
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })

            })
            await Promise.all(listPromises);
            if (addedTasks.length !== 0) {
                addedTasks = addedTasks.map(task => {
                    const newListId = newListsId.find(list => list.oldId === task.todoListId);
                    if (newListId) return {...task, todoListId: newListId.newId}
                    return task
                })
            }
            if (listsOrder.length !== 0) {
                listsOrder = listsOrder.map(item => {
                    const newList = newListsId.find(list => list.oldId === item)
                    if (newList) return newList.newId;
                    return item
                })
            }
            await createAndChangeIdOfTasksInOrderList()
        } else await createAndChangeIdOfTasksInOrderList();
        if (deletedLists.length !== 0) {
            deletedLists.forEach(list => {
                api.deleteTodoList(list.id).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (deletedTasks.length !== 0) {
            deletedTasks.forEach(task => {
                api.deleteTask(task.todoListId, task.id).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (editedLists.length !== 0) {
            editedLists.forEach(list => {
                api.changeTodoListTitle(list.id, list.title).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        if (editedTasks.length !== 0) {
            editedTasks.forEach(task => {
                api.changeTask(task.todoListId, task.id, task).then(data => {
                    if (data.resultCode !== 0) dispatch(actions.setError())
                })
            })
        }
        //swap all items

        //changing id
        if (newListsId.length !== 0) {
            todoListsWithNewId = newTodoLists.map(list => {
                const newList = newListsId.find(item => item.oldId === list.id)
                if (newList) return {...list, id: newList.newId};
                return list
            })
        }
        if (newTasksId.length !== 0) {
            const mappedConst = todoListsWithNewId.length !== 0 ? todoListsWithNewId : newTodoLists;
            todoListsWithNewId = mappedConst.map(list => {
                const tasks = list.tasks.map(task => {
                    const newTask = newTasksId.find(item => item.oldId === task.id)
                    if (newTask) return {...task, id: newTask.newId}
                    return task
                })
                return {...list, tasks}
            })
        }
        if (todoListsWithNewId.length !== 0) {
            dispatch(actions.setTodoListsWithNewId(todoListsWithNewId))
        }

        dispatch(actions.disableEditMode())
    };

export default reducer