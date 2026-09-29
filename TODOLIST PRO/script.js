/* =========================================
   TASKFLOW
   Todo Productivity App
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const categoryInput =
    document.getElementById("categoryInput");

const startDateInput =
    document.getElementById("startDateInput");

const dueDateInput =
    document.getElementById("dueDateInput");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyMessage =
    document.getElementById("emptyMessage");

const totalTasks =
    document.getElementById("totalTasks");

const activeTasks =
    document.getElementById("activeTasks");

const completedTasks =
    document.getElementById("completedTasks");

const taskSummary =
    document.getElementById("taskSummary");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const clearCompleted =
    document.getElementById("clearCompleted");

const clearAll =
    document.getElementById("clearAll");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================
   STATE
========================================= */

let tasks = [];

let currentFilter = "all";

let currentSearch = "";

let currentSort = "newest";


const STORAGE_KEY =
    "taskflow_tasks";

const THEME_KEY =
    "taskflow_theme";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTasks();

        loadTheme();

        renderTasks();

        updateStats();

    }
);


/* =========================================
   ADD TASK
========================================= */

taskForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const title =
            taskInput.value.trim();

        const priority =
            priorityInput.value;

        const category =
            categoryInput.value;

        const startDate =
            startDateInput.value;

        const dueDate =
            dueDateInput.value;


        /* Empty task validation */

        if (!title) {

            showToast(
                "Please enter a task."
            );

            taskInput.focus();

            return;

        }


        /* Date validation */

        if (
            startDate &&
            dueDate &&
            dueDate < startDate
        ) {

            showToast(
                "Due date cannot be before start date."
            );

            dueDateInput.focus();

            return;

        }


        /* Duplicate task check */

        const duplicate =
            tasks.find(
                task =>
                    task.title.toLowerCase() ===
                    title.toLowerCase()
            );


        if (duplicate) {

            showToast(
                "This task already exists."
            );

            return;

        }


        /* Create task */

        const newTask = {

            id: Date.now(),

            title: title,

            priority: priority,

            category: category,

            startDate: startDate,

            dueDate: dueDate,

            completed: false,

            createdAt:
                new Date().toISOString()

        };


        tasks.unshift(newTask);


        saveTasks();

        renderTasks();

        updateStats();


        /* Reset form */

        taskForm.reset();

        priorityInput.value =
            "medium";

        categoryInput.value =
            "Study";


        taskInput.focus();


        showToast(
            "Task added successfully."
        );

    }
);


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    let visibleTasks =
        [...tasks];


    /* Filter */

    if (currentFilter === "active") {

        visibleTasks =
            visibleTasks.filter(
                task => !task.completed
            );

    }


    if (currentFilter === "completed") {

        visibleTasks =
            visibleTasks.filter(
                task => task.completed
            );

    }


    /* Search */

    if (currentSearch) {

        visibleTasks =
            visibleTasks.filter(
                task =>
                    task.title
                        .toLowerCase()
                        .includes(
                            currentSearch.toLowerCase()
                        )
            );

    }


    /* Sort */

    visibleTasks =
        sortTasks(visibleTasks);


    taskList.innerHTML = "";


    /* Empty state */

    if (visibleTasks.length === 0) {

        taskList.style.display =
            "none";

        emptyState.style.display =
            "block";

        updateEmptyState();

        updateSummary(0);

        return;

    }


    taskList.style.display =
        "flex";

    emptyState.style.display =
        "none";


    visibleTasks.forEach(
        task => {

            const taskElement =
                createTaskElement(task);

            taskList.appendChild(
                taskElement
            );

        }
    );


    updateSummary(
        visibleTasks.length
    );

}


/* =========================================
   SORT TASKS
========================================= */

function sortTasks(taskArray) {

    const sorted =
        [...taskArray];


    /* Newest */

    if (currentSort === "newest") {

        sorted.sort(
            (a, b) =>
                b.id - a.id
        );

    }


    /* Oldest */

    if (currentSort === "oldest") {

        sorted.sort(
            (a, b) =>
                a.id - b.id
        );

    }


    /* Priority */

    if (currentSort === "priority") {

        const priorityOrder = {

            high: 1,

            medium: 2,

            low: 3

        };


        sorted.sort(
            (a, b) =>
                priorityOrder[a.priority] -
                priorityOrder[b.priority]
        );

    }


    /* Start Date */

    if (currentSort === "startDate") {

        sorted.sort(
            (a, b) => {

                if (!a.startDate)
                    return 1;

                if (!b.startDate)
                    return -1;

                return (
                    new Date(a.startDate) -
                    new Date(b.startDate)
                );

            }
        );

    }


    /* Due Date */

    if (currentSort === "dueDate") {

        sorted.sort(
            (a, b) => {

                if (!a.dueDate)
                    return 1;

                if (!b.dueDate)
                    return -1;

                return (
                    new Date(a.dueDate) -
                    new Date(b.dueDate)
                );

            }
        );

    }


    return sorted;

}


/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const li =
        document.createElement("li");


    li.className =
        "task-item";


    if (task.completed) {

        li.classList.add(
            "completed"
        );

    }


    /* Checkbox */

    const checkbox =
        document.createElement("input");

    checkbox.type =
        "checkbox";

    checkbox.className =
        "task-checkbox";

    checkbox.checked =
        task.completed;


    checkbox.addEventListener(
        "change",
        () => {

            toggleTask(task.id);

        }
    );


    /* Content */

    const content =
        document.createElement("div");

    content.className =
        "task-content";


    const title =
        document.createElement("div");

    title.className =
        "task-title";

    title.textContent =
        task.title;


    content.appendChild(title);


    /* Meta */

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    /* Priority */

    const priorityBadge =
        document.createElement("span");

    priorityBadge.className =
        `badge priority-${task.priority}`;

    priorityBadge.textContent =
        `${capitalize(task.priority)} Priority`;


    meta.appendChild(
        priorityBadge
    );


    /* Category */

    const categoryBadge =
        document.createElement("span");

    categoryBadge.className =
        "badge category-badge";

    categoryBadge.textContent =
        task.category;


    meta.appendChild(
        categoryBadge
    );


    /* Start Date */

    if (task.startDate) {

        const startBadge =
            document.createElement("span");

        startBadge.className =
            "badge date-badge";

        startBadge.textContent =
            `📅 Start: ${formatDate(
                task.startDate
            )}`;


        meta.appendChild(
            startBadge
        );

    }


    /* Due Date */

    if (task.dueDate) {

        const dueBadge =
            document.createElement("span");

        dueBadge.className =
            "badge date-badge";

        dueBadge.textContent =
            `🏁 Due: ${formatDate(
                task.dueDate
            )}`;


        meta.appendChild(
            dueBadge
        );

    }


    content.appendChild(meta);


    /* Buttons */

    const buttons =
        document.createElement("div");

    buttons.className =
        "task-buttons";


    /* Edit */

    const editButton =
        document.createElement("button");

    editButton.type =
        "button";

    editButton.className =
        "edit-btn";

    editButton.textContent =
        "✏️";

    editButton.title =
        "Edit task";


    editButton.addEventListener(
        "click",
        () => {

            editTask(task.id);

        }
    );


    /* Delete */

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-btn";

    deleteButton.textContent =
        "🗑️";

    deleteButton.title =
        "Delete task";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteTask(task.id);

        }
    );


    buttons.appendChild(
        editButton
    );

    buttons.appendChild(
        deleteButton
    );


    li.appendChild(
        checkbox
    );

    li.appendChild(
        content
    );

    li.appendChild(
        buttons
    );


    return li;

}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateStats();


    showToast(
        task.completed
            ? "Task completed."
            : "Task marked as active."
    );

}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    const taskItems =
        document.querySelectorAll(
            ".task-item"
        );


    taskItems.forEach(
        item => {

            const titleElement =
                item.querySelector(
                    ".task-title"
                );


            if (
                titleElement &&
                titleElement.textContent ===
                task.title
            ) {

                const input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "text";

                input.className =
                    "edit-input";

                input.value =
                    task.title;

                input.maxLength =
                    100;


                titleElement.replaceWith(
                    input
                );


                input.focus();

                input.select();


                const saveEdit =
                    () => {

                        const newTitle =
                            input.value.trim();


                        if (!newTitle) {

                            renderTasks();

                            return;

                        }


                        task.title =
                            newTitle;


                        saveTasks();

                        renderTasks();

                        updateStats();


                        showToast(
                            "Task updated."
                        );

                    };


                input.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            saveEdit();

                        }


                        if (
                            event.key ===
                            "Escape"
                        ) {

                            renderTasks();

                        }

                    }
                );


                input.addEventListener(
                    "blur",
                    saveEdit
                );

            }

        }
    );

}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) return;


    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();

    updateStats();


    showToast(
        "Task deleted."
    );

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    () => {

        currentSearch =
            searchInput.value.trim();

        renderTasks();

    }
);


/* =========================================
   FILTERS
========================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderTasks();

            }
        );

    }
);


/* =========================================
   SORT
========================================= */

sortSelect.addEventListener(
    "change",
    () => {

        currentSort =
            sortSelect.value;

        renderTasks();

    }
);


/* =========================================
   CLEAR COMPLETED
========================================= */

clearCompleted.addEventListener(
    "click",
    () => {

        const completedCount =
            tasks.filter(
                task => task.completed
            ).length;


        if (completedCount === 0) {

            showToast(
                "No completed tasks."
            );

            return;

        }


        const confirmed =
            confirm(
                `Delete ${completedCount} completed task(s)?`
            );


        if (!confirmed) return;


        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        renderTasks();

        updateStats();


        showToast(
            "Completed tasks cleared."
        );

    }
);


/* =========================================
   CLEAR ALL
========================================= */

clearAll.addEventListener(
    "click",
    () => {

        if (tasks.length === 0) {

            showToast(
                "There are no tasks."
            );

            return;

        }


        const confirmed =
            confirm(
                "Are you sure you want to delete ALL tasks?"
            );


        if (!confirmed) return;


        tasks = [];


        saveTasks();

        renderTasks();

        updateStats();


        showToast(
            "All tasks deleted."
        );

    }
);


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const active =
        total - completed;


    totalTasks.textContent =
        total;

    activeTasks.textContent =
        active;

    completedTasks.textContent =
        completed;


    /* Progress */

    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    progressFill.style.width =
        `${progress}%`;

    progressText.textContent =
        `${progress}%`;

}


/* =========================================
   SUMMARY
========================================= */

function updateSummary(count) {

    taskSummary.textContent =
        `${count} ${
            count === 1
                ? "task"
                : "tasks"
        }`;

}


/* =========================================
   EMPTY STATE
========================================= */

function updateEmptyState() {

    if (currentSearch) {

        emptyTitle.textContent =
            "No matching tasks";

        emptyMessage.textContent =
            "Try searching for a different task.";

        return;

    }


    if (currentFilter === "active") {

        emptyTitle.textContent =
            "No active tasks";

        emptyMessage.textContent =
            "Great! You have completed everything.";

        return;

    }


    if (currentFilter === "completed") {

        emptyTitle.textContent =
            "No completed tasks";

        emptyMessage.textContent =
            "Complete a task and it will appear here.";

        return;

    }


    emptyTitle.textContent =
        "No tasks yet";

    emptyMessage.textContent =
        "Add your first task and start being productive.";

}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (savedTasks) {

            tasks =
                JSON.parse(savedTasks);

        }

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        tasks = [];

    }

}


/* =========================================
   THEME
========================================= */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            THEME_KEY,
            isDark
                ? "dark"
                : "light"
        );


        updateThemeIcon();

    }
);


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeIcon();

}


function updateThemeIcon() {

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    themeIcon.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then(() => {
                console.log("TaskFlow Service Worker registered successfully.");
            })
            .catch((error) => {
                console.error("Service Worker registration failed:", error);
            });
    });
}