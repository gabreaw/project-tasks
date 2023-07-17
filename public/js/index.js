const input = document.getElementById("todo-input");
const btn = document.getElementById("btn");
const lanesContainer = document.querySelector(".lanes");

const socket = new WebSocket("ws://localhost:8080/admin");
socket.addEventListener("open", () => {
    console.log("Conexão estabelecida com sucesso!");
});
socket.addEventListener("message", (event) => {
    reload()
});
btn.addEventListener("click", (event) => {
    removeColumns();
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
            toastError();
        }
    };

    request.onerror = function () {
        console.error("Erro na requisição: falha de rede");
        toastError();
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

function addTask(columnId, taskName, taskId, taskDescription) {
    const column = document.getElementById("column-" + columnId);
    const taskList = column.querySelector(".task-list");

    const newTask = document.createElement("div");
    newTask.classList.add("task");
    newTask.setAttribute("draggable", "true");
    newTask.setAttribute("id", "task-" + taskId);

    newTask.innerText = taskName;

    newTask.addEventListener("click", () => {
        modal(taskName, taskDescription);
    });

    newTask.addEventListener("dragstart", () => {
        newTask.classList.add("is-dragging");
    });
    newTask.addEventListener("dragend", () => {
        newTask.classList.remove("is-dragging");
    });
    taskList.appendChild(newTask);
}

function modal(taskName, taskDescription) {
    const modal = document.createElement("div");
    modal.classList.add("modal-bd");

    setTimeout(function() {
        modal.classList.add("modal-ativo");
    }, 100);

    const container = document.createElement("div");
    container.classList.add("container-fl");

    const col = document.createElement("div");
    col.classList.add("texts");
    col.style.position = "relative";

    const nameElement = document.createElement("h3");
    nameElement.innerText = taskName;

    const descriptionElement = document.createElement("p");
    descriptionElement.innerText = taskDescription;

    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerText = "X";
    closeButton.addEventListener("click", function() {
        modal.classList.add("modal-close");
        setTimeout(function() {
            modal.remove();
        }, 600);
    });

    col.appendChild(closeButton);
    col.appendChild(nameElement);
    col.appendChild(descriptionElement);

    container.appendChild(col);

    modal.appendChild(container);

    document.body.appendChild(modal);
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
                            addTask(column.id, task.title, task.id, task.description);
                        });
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar tarefas:", error.message);
                        toastError();
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

document.addEventListener("DOMContentLoaded", reload);
input.value = '';
