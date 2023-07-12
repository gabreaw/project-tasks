function toastErr() {
    const toastError = document.createElement("div");
    toastError.classList.add("toastError");
    const pError = document.createElement("p");
    pError.classList.add("toastTittle");
    const strong = document.createElement("strong");
    strong.innerText = "Preencha os campos corretamente!";

    pError.appendChild(strong)
    toastError.appendChild(pError);

    const parentElement = document.body;
    const firstChild = parentElement.firstChild;
    parentElement.insertBefore(toastError, firstChild);
    toastError.addEventListener("click", () => {
        toastError.classList.add("hide");
    });
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


function checkFormFields() {
    const titleField = document.getElementById('title');
    const descriptionField = document.getElementById('description');

    if (!titleField.value || !descriptionField.value) {
        toastErr();
        return false;
    }

    return true;
}

const submitButton = document.getElementById('button');
submitButton.addEventListener('click', function(event) {
    if (!checkFormFields()) {
        event.preventDefault();
    }
});