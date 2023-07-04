const input = document.getElementById("todo-input");
const btn = document.getElementById("btn");

const socket = new WebSocket("ws://localhost:8081/admin");
socket.addEventListener("open", () => {
    console.log("Conexão estabelecida com sucesso!");
});
socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    updateContent(message);
});

btn.addEventListener("click", (event) => {
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


const lanesContainer = document.querySelector(".lanes");

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

function updateContent(message) {
    console.log("Mensagem recebida:", message);
        const taskId = message.taskId;
        const taskName = message.name;
        console.log("ID da tarefa:", taskId);
        console.log("Nome da tarefa:", taskName);

        const taskElement = document.getElementById(taskId);
        console.log("Elemento da tarefa:", taskElement);

        if (taskElement) {
            taskElement.innerText = taskName;
        }
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
                updateContent(message);
                toastW();
                console.log(message)
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

function toastW(){
    const existingToast = document.getElementById('toast');
    if (existingToast) {
        existingToast.remove();
    }
    const toast = document.createElement("div");
    toast.classList.add("toastW");
    toast.id = "toast";
    const p = document.createElement("p");
    p.classList.add("toastTittle");
    const strong = document.createElement("strong");
    strong.innerText = "Atualização feita com sucesso!!";

    p.appendChild(strong)
    toast.appendChild(p);

    const parentElement = document.body;
    const firstChild = parentElement.firstChild;
    parentElement.insertBefore(toast, firstChild);
    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);

    setTimeout(function () {
        toast.classList.add("show");
    }, 10);
}
function toastL(){
    const toastError = document.createElement("div");
    toastError.classList.add("toastL");
    const pError = document.createElement("p");
    pError.classList.add("toastTittle");
    const strong = document.createElement("strong");
    strong.innerText = "Erro: " + error.message;

    pError.appendChild(strong)
    toastError.appendChild(pError);

    const parentElement = document.body;
    const firstChild = parentElement.firstChild;
    parentElement.insertBefore(toastError, firstChild);
    setTimeout(function () {
        toastError.classList.add("hide");
        setTimeout(function () {
            toastError.remove();
        }, 300);
    }, 3000);

    setTimeout(function () {
        toastError.classList.add("show");
    }, 10);
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
function main() {
    const lanes = document.querySelectorAll(".swim-lane");
    lanes.forEach((lane) => {
        lane.parentNode.removeChild(lane);
    });

    fetch("/admin/get-column")
        .then((response) => response.json())
        .then((columns) => {
            columns.forEach((column) => {
                const line = createLine(column);
                lanesContainer.appendChild(line);

                fetch(`/admin/get-tasks-by-column/${column.id}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Erro na requisição, status = ${response.status}`);
                        }
                        if (response.status !== 204) {
                            return response.json();
                        } else {
                            return [];
                        }
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

document.addEventListener("DOMContentLoaded", main);
input.value = '';
