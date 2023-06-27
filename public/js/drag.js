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
        const { top } = task.getBoundingClientRect();

        const offset = mouseY - top;

        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    }
    return closestTask;
};
