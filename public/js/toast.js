function toastW() {
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
    toast.addEventListener("click", () => {
        toast.classList.add("hide");
    })
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

function toastL(error) {
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
    toastError.addEventListener("click", () => {
        toastError.classList.add("hide");
    })
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