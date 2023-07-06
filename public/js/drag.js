let draggables = document.getElementsByClassName("task");

for (let i = 0; i < draggables.length; i++) {
    const task = draggables[i];

    task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
    });

    task.addEventListener("dragend", (event) => {
        task.classList.remove("is-dragging");

    });
}
const insertAboveTask = (zone, mouseY) => {
    const els = zone.getElementsByClassName("task");

    let closestTask = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < els.length; i++) {
        const task = els[i];
        const {top} = task.getBoundingClientRect();

        const offset = mouseY - top;

        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    }
    return closestTask;
};

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

