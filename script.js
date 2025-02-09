document.addEventListener('DOMContentLoaded', (event) => {
    //Élements du DOM
    const main = document.querySelector('main');
    const createListButton = document.getElementById('createListButton');
    const filtersContainer = document.getElementById('filtersContainer');
    const listContainer = document.getElementById('listContainer');
    const ul = listContainer.querySelector('ul');

    //Formulaire pour ajouter une liste
    const titlePrompt = document.getElementById('titlePrompt');
    const titleInput = document.getElementById('titlePromptInput');
    const submitButton = document.getElementById('titlePromptSubmitButton');
    const cancelButton = document.getElementById('titlePromptCancelButton');

    //Formulaire pour ajouter une tâche
    const taskPrompt = document.getElementById('taskPrompt');
    const taskTitlePromptInput = document.getElementById('taskTitlePromptInput');
    const taskDatePromptInput = document.getElementById('taskDatePromptInput');
    const priotitySelect = document.getElementById('prioritySelect');
    const taskSubmitButton = document.getElementById('taskPromptSubmitButton');
    const taskCancelButton = document.getElementById('taskPromptCancelButton');

    //Formulaire pour modifier une tâche
    const editTaskPrompt = document.getElementById('editTaskPrompt');
    const editTaskTitlePromptInput = document.getElementById('editTaskTitlePromptInput');
    const editTaskDatePromptInput = document.getElementById('editTaskDatePromptInput');
    const editPrioritySelect = document.getElementById('editPrioritySelect');
    const editTaskPromptCancelButton = document.getElementById('editTaskPromptCancelButton');
    const editTaskPromptSubmitButton = document.getElementById('editTaskPromptSubmitButton');

    //Boutons pour filtrer
    const completeTaskFilterButton = document.getElementById('completeTaskFilterButton');
    const remainingTaskFilterButton = document.getElementById('remainingTaskFilterButton');

    //Variables
    let lists = [];
    let activeListIndex = null;
    let activeFilter = null;
    let checkboxID = 1;
    let currentTask = null;

    const priorityMapping = {
        none: 'Aucune',
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevée'
    };

    //Fonction de sauvegarde dans le localStorage
    function saveToLocalStorage() {
        localStorage.setItem('taskLists', JSON.stringify(lists));
    }

    //Fonction de chargement depuis le localStorage
    function loadFromLocalStorage() {
        const savedLists = localStorage.getItem('taskLists');
        if (savedLists) {
            lists = JSON.parse(savedLists);
        }
    }

    //Mettre à jour les container en fonction de la présence de tâche ou non dans une liste
    function updateListContainerVisibility() {
        if (lists.length === 0) {
            listContainer.style.display = 'none';
            filtersContainer.style.display = 'none';
            emptyMessage.style.display = 'block';
            main.style.alignItems = 'center';
        } else {
            listContainer.style.display = 'flex';
            filtersContainer.style.display = 'flex';
            emptyMessage.style.display = 'none';
            main.style.alignItems = 'flex-start';
        }
    }

    //Fonction pour créer et gérer des listes
    function renderLists() {
        ul.innerHTML = '';
        lists.forEach((list, index) => {
            //Pour chaque liste créer des éléments
            const listElement = document.createElement('li');
            const listTitleDiv = document.createElement('div');
            listTitleDiv.classList.add('list-title');

            const toggleButton = document.createElement('button');
            toggleButton.classList.add('toggle-subtask');
            toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="34" height="34" viewBox="0 0 24 24"><path d="M 12 6.9296875 L 5.9296875 13 L 7.4296875 14.5 L 12 9.9296875 L 16.570312 14.5 L 18.070312 13 L 12 6.9296875 z"></path></svg>`;

            //Si la liste est vide on désactive le bouton toggle
            if (list.tasks.length === 0) {
                toggleButton.disabled = true;
                toggleButton.classList.add('toggle-st-disabled');
            } else {
                toggleButton.disabled = false;
                toggleButton.classList.remove('toggle-st-disabled');
            }

            const listTitleText = document.createElement('span');
            listTitleText.textContent = list.name;

            const addSubtaskButton = document.createElement('button');
            addSubtaskButton.classList.add('add-subtask');
            addSubtaskButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 24 24"><path d="M 11 3 L 11 11 L 3 11 L 3 13 L 11 13 L 11 21 L 13 21 L 13 13 L 21 13 L 21 11 L 13 11 L 13 3 L 11 3 z"></path></svg>`;

            const deleteListButton = document.createElement('button');
            deleteListButton.classList.add('delete-list');
            deleteListButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 24 24"><path d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"></path></svg>`;

            listTitleDiv.appendChild(toggleButton);
            listTitleDiv.appendChild(listTitleText);
            listTitleDiv.appendChild(addSubtaskButton);
            listTitleDiv.appendChild(deleteListButton);
            listElement.appendChild(listTitleDiv);

            const nestedUL = document.createElement('ul');
            nestedUL.classList.add('nested', 'active');

            const tasksDisplayed = renderTasks(list, nestedUL);

            //Si la liste est vide on désactive le bouton toggle
            if (tasksDisplayed === 0) {
                toggleButton.disabled = true;
                toggleButton.classList.add('toggle-st-disabled');
            } else {
                toggleButton.disabled = false;
                toggleButton.classList.remove('toggle-st-disabled');
            }

            renderTasks(list, nestedUL);
            listElement.appendChild(nestedUL);

            ul.appendChild(listElement);

            //Bouton pour ajouter une tâche
            addSubtaskButton.addEventListener('click', () => {
                activeListIndex = index;
                //Afficher le formulaire pour ajouter une tâche
                taskPrompt.style.display = 'flex';
                taskTitlePromptInput.value = '';
                taskDatePromptInput.value = '';
                priotitySelect.value = 'none';
            });

            //Bouton pour afficher/masquer les tâches
            toggleButton.addEventListener('click', () => {
                //Si le bouton est désactivé bloque l'action
                if (toggleButton.disabled === true) {
                    return;
                }
                nestedUL.classList.toggle('active');
                toggleButton.classList.toggle('caret-down');
            });

            //Bouton pour supprimer une liste
            deleteListButton.addEventListener('click', () => {
                lists.splice(index, 1);
                saveToLocalStorage();
                renderLists();
                updateListContainerVisibility();
            });
        });
    }

    function renderTasks(list, nestedUL) {
        nestedUL.innerHTML = '';
        let tasksDisplayed = 0;

        list.tasks.forEach((task) => {
            //Vérifier si la tâche doit être affichée
            const shouldDisplay = (activeFilter === 'complete' && task.completed) || (activeFilter === 'remaining' && !task.completed) || activeFilter === null;

            if (shouldDisplay === false) {
                return;
            }            

            tasksDisplayed++;
            checkboxID++;

            //Création des éléments pour chaque tâche
            const subTaskLI = document.createElement('li');
            subTaskLI.classList.add('subtask');
            const subTaskDiv = document.createElement('div');
            subTaskDiv.classList.add('task-title');

            const checkboxDiv = document.createElement('div');
            checkboxDiv.classList.add('container');

            const subTaskCheckbox = document.createElement('input');
            subTaskCheckbox.type = 'checkbox';
            subTaskCheckbox.classList.add('task-checkbox');
            subTaskCheckbox.checked = task.completed;
            subTaskCheckbox.id = `task-checkbox-${checkboxID}`;
            subTaskCheckbox.addEventListener('change', () => {
                task.completed = subTaskCheckbox.checked;
                saveToLocalStorage(); //Sauvegarde après changement d'état
                renderLists();
            });

            const checkmark = document.createElement('label');
            checkmark.classList.add('checkmark');
            checkmark.setAttribute('for', subTaskCheckbox.id);

            const textCBSpanContainer = document.createElement('div');
            textCBSpanContainer.classList.add('text-cb-container');
            const textCBSpan = document.createElement('span');
            textCBSpan.classList.add('text-cb');
            textCBSpan.textContent = task.name;

            textCBSpanContainer.appendChild(textCBSpan);
            checkboxDiv.appendChild(subTaskCheckbox);
            checkboxDiv.appendChild(checkmark);
            checkboxDiv.appendChild(textCBSpanContainer);

            const dateTimeText = document.createElement('p');
            const originalDate = new Date(task.date);
            //Format date JJ/MM/AAAA
            const formattedDate = `${originalDate.getDate().toString().padStart(2, '0')}/${(originalDate.getMonth() + 1).toString().padStart(2, '0')}/${originalDate.getFullYear()}`;
            dateTimeText.textContent = formattedDate;
            dateTimeText.classList.add('date-time');

            const priorityDiv = document.createElement('div');
            priorityDiv.classList.add('priorityDiv');
            const priorityText = document.createElement('p');
            //Affichage de la priorité
            priorityText.textContent = priorityMapping[task.priority] || 'Aucune';
            priorityText.classList.add(`priority-${task.priority}`);

            const optionsButton = document.createElement('button');
            optionsButton.classList.add('options-button');
            optionsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24"><path d="M 6 10 A 2 2 0 0 0 4 12 A 2 2 0 0 0 6 14 A 2 2 0 0 0 8 12 A 2 2 0 0 0 6 10 z M 12 10 A 2 2 0 0 0 10 12 A 2 2 0 0 0 12 14 A 2 2 0 0 0 14 12 A 2 2 0 0 0 12 10 z M 18 10 A 2 2 0 0 0 16 12 A 2 2 0 0 0 18 14 A 2 2 0 0 0 20 12 A 2 2 0 0 0 18 10 z"></path></svg>`;

            const dropdownMenu = document.createElement('ul');
            dropdownMenu.classList.add('dropdown-menu');
            dropdownMenu.style.display = 'none';

            const editOption = document.createElement('li');
            editOption.textContent = 'Modifier';
            editOption.classList.add('dropdown-item');

            const deleteOption = document.createElement('li');
            deleteOption.textContent = 'Supprimer';
            deleteOption.classList.add('dropdown-item');

            dropdownMenu.appendChild(editOption);
            dropdownMenu.appendChild(deleteOption);

            //Afficher le dropdown
            optionsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });

            //Masquer le dropdown quand on clique en dehors
            document.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
            });

            dropdownMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            //Bouton qui affiche un formulaire pour modifier une tâche
            editOption.addEventListener('click', () => {
                editTaskPrompt.style.display = 'flex';
                dropdownMenu.style.display = 'none';
                editTaskTitlePromptInput.value = task.name;
                editTaskDatePromptInput.value = task.date;
                editPrioritySelect.value = task.priority;
            
                currentTask = task;
            });

            editTaskPromptCancelButton.addEventListener('click', () => {
                editTaskPrompt.style.display = 'none';
                currentTask = null;
            });
            
            //Bouton pour soumettre les modifications
            editTaskPromptSubmitButton.addEventListener('click', () => {
                const taskName = editTaskTitlePromptInput.value.trim();
                const taskDate = editTaskDatePromptInput.value;
                const priority = editPrioritySelect.value;

                if (!taskName || !taskDate) {
                    console.log("Erreur : Veuillez remplir tous les champs et sélectionner une priorité.");
                    return;
                }            
                
                if (currentTask) {
                    currentTask.name = editTaskTitlePromptInput.value;
                    currentTask.date = editTaskDatePromptInput.value;
                    currentTask.priority = editPrioritySelect.value;
                    saveToLocalStorage();
                    renderLists();
                    editTaskPrompt.style.display = 'none';
                    currentTask = null;
                }
            });

            //Suprimmer une tâche
            deleteOption.addEventListener('click', () => {
                const taskIndex = list.tasks.indexOf(task);
                if (taskIndex > -1) {
                    list.tasks.splice(taskIndex, 1);
                    saveToLocalStorage();
                    renderLists();
                }
            });

            subTaskDiv.appendChild(checkboxDiv);
            subTaskDiv.appendChild(dateTimeText);
            subTaskDiv.appendChild(priorityDiv);
            priorityDiv.appendChild(priorityText);
            subTaskDiv.appendChild(optionsButton);
            subTaskDiv.appendChild(dropdownMenu);
            subTaskLI.appendChild(subTaskDiv);
            nestedUL.appendChild(subTaskLI);
        });
        return tasksDisplayed;
    }

    createListButton.addEventListener('click', () => {
        titlePrompt.style.display = 'flex';
        titleInput.value = '';
    });

    cancelButton.addEventListener('click', () => {
        titlePrompt.style.display = 'none';
    });

    //Ajouter une liste
    submitButton.addEventListener('click', () => {
        const listName = titleInput.value.trim(); //Vérifie si le champ est rempli

        if (!listName) {
            console.log("Erreur : Veuillez saisir un nom pour la liste.");
            return;
        }

        titlePrompt.style.display = 'none';
        lists.push({ name: listName, tasks: [] });
        saveToLocalStorage(); //Sauvegarde après ajout de liste
        renderLists();
        updateListContainerVisibility();
        titleInput.value = '';
    });

    taskCancelButton.addEventListener('click', () => {
        taskPrompt.style.display = 'none';
    });

    //Ajouter une tâche
    taskSubmitButton.addEventListener('click', () => {
        const taskName = taskTitlePromptInput.value.trim();
        const taskDate = taskDatePromptInput.value;
        const priority = priotitySelect.value;

        if (!taskName || !taskDate) {
            console.log("Erreur : Veuillez remplir tous les champs et sélectionner une priorité.");
            return;
        }

        taskPrompt.style.display = 'none';
        lists[activeListIndex].tasks.push({ name: taskName, date: taskDate, priority: priority, completed: false });
        saveToLocalStorage(); //Sauvegarde après ajout de tâche
        renderLists();

        taskTitlePromptInput.value = '';
        taskDatePromptInput.value = '';
        priotitySelect.value = 'none';
    });

    //Bouton pour filtrer les tâches complétées
    completeTaskFilterButton.addEventListener('click', () => {
        if (activeFilter === 'complete') {
            activeFilter = null;
            completeTaskFilterButton.classList.remove('active');
        } else {
            activeFilter = 'complete';
            completeTaskFilterButton.classList.add('active');
            remainingTaskFilterButton.classList.remove('active');
        }
        renderLists();
    });

    //Bouton pour filtrer les tâches restantes
    remainingTaskFilterButton.addEventListener('click', () => {
        if (activeFilter === 'remaining') {
            activeFilter = null;
            remainingTaskFilterButton.classList.remove('active');
        } else {
            activeFilter = 'remaining';
            remainingTaskFilterButton.classList.add('active');
            completeTaskFilterButton.classList.remove('active');
        }
        renderLists();
    });

    //Fonction d'initialisation
    loadFromLocalStorage();
    renderLists();
    updateListContainerVisibility();
});