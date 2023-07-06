const input = document.getElementById("todo-input");
const btn = document.getElementById("btn");
const lanesContainer = document.querySelector(".lanes");

const socket = new WebSocket("ws://localhost:8080/admin");
socket.addEventListener("open", () => {
    console.log("Conexão estabelecida com sucesso!");
});
socket.addEventListener("message", (event) => {
    // console.log("Mensagem recebida:", event.data);
    const message = JSON.parse(event.data);
    toastW()
    reload()
});
btn.addEventListener("click", (event) => {
    resetColumns();
    event.preventDefault();
    const name = input.value;
    const message = {
        type: "add-task",
        name: name,
    };
    socket.send(JSON.stringify(message));

    let request = new XMLHttpRequest();
    request.open("POST", "/admin/store", true);

    const formData = new FormData();
    formData.append("name", input.value);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            const response = JSON.parse(request.responseText);
            addTask(response.columnId, response.taskId);
        } else {
            console.error("Erro na requisição:", request.statusText);
        }
    };

    request.onerror = function () {
        console.error("Erro na requisição: falha de rede");
    };

    request.send(formData);

    input.value = '';
});

function createLine(column) {
    const newLane = document.createElement("div");
    newLane.classList.add("swim-lane");
    newLane.setAttribute("id", "column-" + column.id);
    newLane.setAttribute("data-column-id", column.id)

    const newHeading = document.createElement("h3");
    newHeading.classList.add("heading");
    newHeading.innerText = column.name;

    const newTaskList = document.createElement("div");
    newTaskList.classList.add("task-list");

    newLane.appendChild(newHeading);
    newLane.appendChild(newTaskList);

    const lineContainer = document.createElement("div");
    lineContainer.classList.add("lineContainer")
    lineContainer.appendChild(newLane);
    lanesContainer.appendChild(lineContainer);

    newTaskList.addEventListener("dragover", (e) => {
        e.preventDefault();

        const bottomTask = insertAboveTask(newTaskList, e.clientY);
        const curTask = document.querySelector(".is-dragging");

        if (!bottomTask) {
            newTaskList.appendChild(curTask);
        } else {
            newTaskList.insertBefore(curTask, bottomTask);
        }
    });
    drag(newLane)

    return lineContainer;
}

function addTask(columnId, taskName, taskId) {
    const column = document.getElementById("column-" + columnId);
    const taskList = column.querySelector(".task-list");

    const newTask = document.createElement("div");
    newTask.classList.add("task");
    newTask.setAttribute("draggable", "true");
    newTask.setAttribute("id", "task-" + taskId);

    newTask.innerText = taskName;

    newTask.addEventListener("dragstart", () => {
        newTask.classList.add("is-dragging");
    });
    newTask.addEventListener("dragend", () => {
        newTask.classList.remove("is-dragging");
    });
    taskList.appendChild(newTask);
}

function drag(zone) {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();

        const bottomTask = insertAboveTask(zone, e.clientY);
        const curTask = document.querySelector(".is-dragging");
        if (!bottomTask) {
            zone.appendChild(curTask);
        } else {
            zone.insertBefore(curTask, bottomTask);
        }
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();

        const task = document.querySelector(".is-dragging");
        const columnId = zone.getAttribute("id");
        const taskId = task.getAttribute("id");
        const column = document.getElementById(columnId);
        const taskList = column.querySelector(".task-list");
        const tasks = taskList.querySelectorAll(".task");
        const taskOrder = [];
        tasks.forEach((task) => {
            const taskId = task.getAttribute("id").substring(5);
            taskOrder.push(taskId);
        });
        const request = new XMLHttpRequest();
        request.open("POST", "/admin/update-task", false);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                const message = {
                    type: "update-task",
                    taskId: task.getAttribute("id"),
                    name: task.innerText
                };
                toastW();
                // console.log(message)
                socket.send(JSON.stringify(message))
            } else {
                console.error("Erro na requisição:", request.statusText);
            }
        };
        request.onerror = function () {
            console.error("Erro na requisição: falha de rede");
        };
        const formData = new FormData;
        for (var i = 0; i < taskOrder.length; i++) {
            formData.append('taskOrder[]', taskOrder[i]);
        }
        formData.append("columnId", columnId);
        formData.append("taskId", taskId);

        request.send(formData);
    });
}
function reload() {
    removeColumns();
    fetch("/admin/get-column")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro na requisição, status = ${response.status}`);
            }
            return response.json();
        })
        .then((columns) => {
            columns.forEach((column) => {
                const newColumn = createLine(column);
                lanesContainer.appendChild(newColumn);

                fetch(`/admin/get-tasks-by-column/${column.id}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Erro na requisição, status = ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((tasks) => {
                        tasks.sort((a, b) => a.taskOrder - b.taskOrder);
                        tasks.forEach((task) => {
                            addTask(column.id, task.title, task.id);
                        });
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar tarefas:", error.message);
                        toastL();
                    });
            });
        })
        .catch((error) => {
            console.error("Erro ao buscar colunas:", error);
        });
}
function removeColumns() {
    const lanes = document.querySelectorAll(".lineContainer");
    lanes.forEach((lane) => {
        lane.remove();
    });
}
function resetColumns() {
    removeColumns();
    reload();
}

document.addEventListener("DOMContentLoaded", reload);
input.value = '';
