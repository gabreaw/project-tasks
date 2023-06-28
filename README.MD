


Para iniciar o servidor web:
```bash
 php -S localhost:8000
```

        const bottomTask = insertAboveTask(zone, e.clientY);
        const curTask = document.querySelector(".is-dragging");
        if (!bottomTask) {
            zone.appendChild(curTask);
        } else {
            zone.insertBefore(curTask, bottomTask);
        }
