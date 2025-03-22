document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    //const currentUser = localStorage.getItem("loggedUser");
    // Load tasks from local storage
    loadTasks();

    addTaskBtn.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;
        const dueTime = prompt("Set a reminder (Enter time in HH:MM format 24hr clock):");
        if (!dueTime || !/^\d{2}:\d{2}$/.test(dueTime)) {
            alert("Invalid time format! Use HH:MM (24-hour format)");
            return;
        }

        addTask(taskText, false, dueTime);
        saveTasks();
        taskInput.value = "";
        //Notify the user
        showToast("Task added successfully!");
    });

    function addTask(text, completed, dueTime) {
        console.log("Adding task:", text, "Completed:", completed);

        const li = document.createElement("li");

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${completed ? "checked" : ""}>
            <span class="task-text ${completed ? "completed" : ""}">${text} <small>(${dueTime})</small></span>
            <div>
                <button class="edit">✏️</button>
                <button class="delete">❌</button>
            </div>
        `;
        li.dataset.dueTime = dueTime;
        // Checkbox event: Mark task as completed
        li.querySelector(".task-checkbox").addEventListener("change", function () {
            li.querySelector(".task-text").classList.toggle("completed");
            saveTasks();
            //Notify the user
            const taskStatus =
                li.querySelector(".task-text").classList.contains("completed") ? "completed" : "reopened";
            showToast(`Task ${taskStatus}!`);
        });

        // Edit task
        li.querySelector(".edit").addEventListener("click", function () {
            const taskTextElement = li.querySelector(".task-text");
            const currentText = taskTextElement.textContent;

            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.value = currentText;
            inputField.classList.add("edit-input");

            li.replaceChild(inputField, taskTextElement);
            inputField.focus();

            inputField.addEventListener("keypress", function (event) {
                if (event.key === "Enter") saveEdit();
            });
            inputField.addEventListener("blur", saveEdit);

            function saveEdit() {
                const newText = inputField.value.trim();
                if (newText !== "") {
                    const dueTime = li.dataset.dueTime;
                    taskTextElement.innerHTML = `${newText} <small>(${dueTime})</small>`;
                    li.replaceChild(taskTextElement, inputField);
                    saveTasks();
                }
            }
        });

        // Delete task with blast effect

        li.querySelector(".delete").addEventListener("click", function () {
            blastEffect(li); // Apply the blast animation
            setTimeout(() => {
                li.remove();
                saveTasks();
                //notify the user
                showToast("Task deleted!");
            }, 500); // Wait for animation to finish before removing
        });

        taskList.appendChild(li);
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll("#taskList li").forEach(li => {
            tasks.push({
                text: li.querySelector(".task-text").textContent.split("(")[0].trim(),
                completed: li.querySelector(".task-checkbox").checked,
                dueTime: li.dataset.dueTime
            });
        });

        // Save tasks for the logged-in user
        const currentUser = localStorage.getItem("loggedInUser");
        if (currentUser) {
            localStorage.setItem("tasks_" + currentUser, JSON.stringify(tasks));
        }
    }

    function loadTasks() {
        const currentUser = localStorage.getItem("loggedInUser");
        if (currentUser) {
            const tasks = JSON.parse(localStorage.getItem("tasks_" + currentUser)) || [];
            tasks.forEach(task => addTask(task.text, task.completed, task.dueTime));
        }
    }
    function checkDueTasks() {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

        document.querySelectorAll("#taskList li").forEach(li => {
            if (li.dataset.dueTime === currentTime) {
                const taskText = li.querySelector(".task-text").textContent.split("(")[0].trim();
                showToast(`Reminder: ${taskText} is due!`);
                playAlarmSound();
                showBrowserNotification(taskText);
            }
        });
    }

    setInterval(checkDueTasks, 60000); // Check every minute
    // *Play Alarm Sound*

    function playAlarmSound() {
        //const alarmSound = new Audio("alarm.mp3"); // Replace with your sound file
        let audio = new Audio("alarm.mp3");

        audio.play().catch(error => console.error("Audio play failed:", error));
    }
    

    // *Browser Notification*
    function showBrowserNotification(taskText) {
        if (Notification.permission === "granted") {
            new Notification("Task Reminder!", { body: `Your task: "${taskText}" is due!` });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Task Reminder!", { body: `Your task: "${taskText}" is due!` });
                }
            });
        }
    }
});




// Blast Effect Function
function blastEffect(element) {
    element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    element.style.transform = "scale(0.3)";
    element.style.opacity = "0";
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeIcon = document.getElementById("darkModeIcon");

// Check and set the correct icon on page load
if (localStorage.getItem("dark-mode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeIcon.textContent = "☼"; // Sun icon for light mode
}

// Toggle Dark Mode and change icon
darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("dark-mode", "enabled");
        darkModeIcon.textContent = "☼"; // Sun icon
    } else {
        localStorage.setItem("dark-mode", "disabled");
        darkModeIcon.textContent = "☽"; // Moon icon
    }
});
//show a toast notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    //hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.getElementById("clearTaskBtn").addEventListener("click", function () {
    if (confirm("Are you sure you want to delete all tasks?")) {
        document.getElementById("taskList").innerHTML = "";
        const currentUser = localStorage.getItem("loggedInUser");
        if (currentUser) {
            localStorage.removeItem("tasks_"+ currentUser);
        }
    };
});

document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser"); // Remove the stored user
    window.location.href = "login.html"; // Redirect to login page
});

const testBtn = document.getElementById("testButton");
if (testBtn) {
    testBtn.addEventListener("click", function () {
        let audio = new Audio("alarm.mp3");
        audio.play().catch(error => console.error("Playback error:", error));
    });
}