document.addEventListener('DOMContentLoaded', function() {
    // --- Общая логика ---

    // 1. Обработка форм удаления (запрос подтверждения)
    const deleteConfirmForms = document.querySelectorAll('.delete-confirm');
    deleteConfirmForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const confirmed = confirm('Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.');
            if (confirmed) {
                alert('Внимание: в статичном режиме эта форма не отправляет данные на сервер. Запись не удалена.');
            }
        });
    });

    // 2. Блокировка всех форм, которые пытаются отправить данные (кроме GET-фильтров)
    const editForms = document.querySelectorAll('main form:not([method="get"])');
    editForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Внимание: в статичном режиме эта форма не отправляет данные на сервер. Запись не сохранена.');
        });
    });

    // 3. Форматирование дат в таблицах
    const formatDateCells = document.querySelectorAll('.format-date');
    formatDateCells.forEach(cell => {
        const dateStr = cell.getAttribute('data-date');
        if (dateStr && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            try {
                // Добавляем T00:00:00, чтобы избежать проблем с часовыми поясами
                const date = new Date(dateStr + 'T00:00:00'); 
                if (!isNaN(date.getTime())) {
                    cell.textContent = date.toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
            } catch (error) {
                console.error('Ошибка форматирования даты:', error);
            }
        }
    });

    // 4. Подсветка текущего пункта меню
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const currentFile = window.location.pathname.split('/').pop();
        const linkFile = link.getAttribute('href').split('/').pop();
        if (linkFile === currentFile) {
            link.classList.add('active-nav-link');
        }
    });

    // --- Логика фильтрации расписания (schedule.html и edit_schedule.html) ---

    function setupScheduleFiltering() {
        // Ищем основную таблицу расписания
        const mainTable = document.querySelector('section table');
        if (!mainTable) return;

        const rows = mainTable.querySelectorAll('tbody tr');
        const classFilter = document.getElementById('class_filter');
        const dayFilter = document.getElementById('day_filter');
        
        if (!classFilter || !dayFilter) return;

        // 1. Сбор уникальных классов и дней из таблицы
        const uniqueClasses = new Set();
        const uniqueDays = new Set();

        rows.forEach(row => {
            const columns = row.querySelectorAll('td');
            if (columns.length >= 2) {
                uniqueClasses.add(columns[0].textContent.trim()); // Класс
                uniqueDays.add(columns[1].textContent.trim());    // День
            }
        });

        // 2. Заполнение выпадающих списков
        const populateDropdown = (dropdown, uniqueItems) => {
            dropdown.querySelectorAll('option:not([value="all"])').forEach(option => option.remove());
            const sortedItems = Array.from(uniqueItems).sort();

            sortedItems.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                dropdown.appendChild(option);
            });
        };
        
        populateDropdown(classFilter, uniqueClasses);
        populateDropdown(dayFilter, uniqueDays);
        
        // 3. Функция фильтрации
        const filterTable = () => {
            const selectedClass = classFilter.value;
            const selectedDay = dayFilter.value;

            rows.forEach(row => {
                const columns = row.querySelectorAll('td');
                if (columns.length >= 2) {
                    const rowClass = columns[0].textContent.trim();
                    const rowDay = columns[1].textContent.trim();
                    
                    const classMatch = (selectedClass === 'all' || rowClass === selectedClass);
                    const dayMatch = (selectedDay === 'all' || rowDay === selectedDay);
                    
                    if (classMatch && dayMatch) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        };

        // 4. Назначение обработчиков событий
        classFilter.addEventListener('change', filterTable);
        dayFilter.addEventListener('change', filterTable);
        
        // Предотвращаем отправку GET-формы, чтобы фильтрация осталась клиентской
        const filterForm = document.querySelector('.filters form[method="get"]');
        if (filterForm) {
             filterForm.addEventListener('submit', (e) => e.preventDefault());
        }

        // Инициализация фильтрации при загрузке
        filterTable(); 
    }

    setupScheduleFiltering();
});