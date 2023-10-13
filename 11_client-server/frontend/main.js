const SERVER_URL = "http://localhost:3000";

async function serverAddStudent(newStudent) {
  let response = await fetch(SERVER_URL + "/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStudent),
  });

  let data = await response.json();
  return data;
}

async function serverDeleteStudent(id) {
  let response = await fetch(SERVER_URL + "/api/students/" + id, {
    method: "DELETE",
  });

  let data = await response.json();
  return data;
}

async function serverGetStudents() {
  let response = await fetch(SERVER_URL + "/api/students", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}

// Переменная для хранения списка студентов
let students = [];

const faculties = [
  "Прикладная математика и информатика",
  "Информатика и вычислительная техника",
  "Информационные системы и технологии",
  "Прикладная информатика",
  "Программная инженерия",
  "Информационная безопасность",
];

document.addEventListener("DOMContentLoaded", function () {
  let validation = new JustValidate("#form", {
    errorLabelStyle: {
      color: "rgb(39, 41, 180)",
    },
  });

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Введите имя ученика",
      },
      {
        rule: "minLength",
        value: 2,
        errorMessage: "Минимум 2 символа",
      },
    ])
    .addField("#surename", [
      {
        rule: "required",
        errorMessage: "Введите фамилию ученика",
      },
      {
        rule: "minLength",
        value: 2,
        errorMessage: "Минимум 2 символа",
      },
    ])
    .addField("#middlname", [
      {
        rule: "required",
        errorMessage: "Введите отчество ученика",
      },
      {
        rule: "minLength",
        value: 2,
        errorMessage: "Минимум 2 символа",
      },
    ])
    .addField("#birthdate", [
      {
        rule: "required",
        errorMessage: "Введите дату рождения ученика",
      },
    ])
    .addField("#years-start-study", [
      {
        rule: "required",
        errorMessage: "Введите год начала обучения",
      },
    ]);

  // Получаем элемент формы
  const form = document.getElementById("form");

  //  Функция для поиска студентов и отображения результатов
  function searchStudents(fio, faculty, yearOfAdmission, yearOfGraduation) {
    // Фильтруем список студентов в соответствии с введенными значениями
    const filteredStudents = students.filter((student) => {
      // Пропускаем проверку, если поле для поиска не заполнено
      if (fio && !studentContainsFio(student, fio)) {
        return false;
      }
      if (faculty && student.faculty !== faculty) {
        return false;
      }

      // Извлекаем первые 4 символа года начала обучения и окончания обучения
      const startYear = student.yearsStartStudy.slice(0, 4);
      const endYear = (parseInt(startYear) + 4).toString();

      if (yearOfAdmission && startYear !== yearOfAdmission) {
        return false;
      }
      if (yearOfGraduation && endYear !== yearOfGraduation) {
        return false;
      }
      return true;
    });

    // Обновляем отображение результатов
    displaySearchResults(filteredStudents, faculty);
  }

  // Функция для проверки, содержит ли студент введенное ФИО
  function studentContainsFio(student, fio) {
    const fullName = `${student.name} ${student.surename} ${student.middlname}`;
    return fullName.toLowerCase().includes(fio.toLowerCase());
  }

  // Функция для вычисления возраста на основе даты рождения
  function calculateAge(birthdate) {
    const birthdateDate = new Date(birthdate);
    const currentDate = new Date();

    // Вычисляем разницу между текущей датой и датой рождения
    const ageInMilliseconds = currentDate - birthdateDate;

    // Переводим разницу в годы
    const ageInYears = Math.floor(
      ageInMilliseconds / (365 * 24 * 60 * 60 * 1000)
    );

    return ageInYears;
  }

  // Получаем элементы для поиска
  const searchFioInput = document.getElementById("search-fio");
  const searchFacultyInput = document.getElementById("search-faculty");
  const searchYearOfAdmissionInput = document.getElementById(
    "search-year-of-admission"
  );
  const searchYearOfGraduationInput = document.getElementById(
    "search-year-of-graduation"
  );

  // Функция для отображения результатов поиска
  function displaySearchResults(searchResults, faculty) {
    const tableBody = document.getElementById("student-upload");
    tableBody.innerHTML = ""; // Очищаем текущее содержимое tbody

    searchResults.forEach((student, index) => {
      const age = calculateAge(student.birthdate); // Вычисляем возраст

      // Определяем год окончания обучения (через 4 года)
      const startYear = parseInt(student.yearsStartStudy);
      const endYear = startYear + 4;

      // Получаем текущий год
      const currentYear = new Date().getFullYear();

      // Определяем номер курса или "закончил"
      let courseInfo = "";
      if (currentYear > endYear) {
        courseInfo = "закончил";
      } else {
        const course = currentYear - startYear + 1;
        courseInfo = `${course} курс`;
      }

      // Получаем название факультета из параметра faculty, если он передан, иначе из объекта студента
      let studentFaculty = faculty || student.faculty;

      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${student.name} ${student.surename} ${student.middlname}</td>
            <td>${studentFaculty}</td>
            <td>${student.birthdate} (${age} лет)</td>
            <td>${startYear}-${endYear} (${courseInfo})</td>
            <td>
                <button class="btn btn-danger delete-button" data-index="${index}">Удалить</button>
            </td>
        `;

      tableBody.appendChild(row);
    });

    // Обработчик события для кнопок удаления
    function handleDeleteButtonClick(event) {
      const index = event.target.dataset.index;

      // Удаляем студента из массива по индексу
      students.splice(index, 1);

      // Обновляем данные в localStorage
      localStorage.setItem("studentObj", JSON.stringify(students));

      // После удаления студента обновляем отображение
      displaySearchResults(students);
    }

    // Добавляем обработчик события для кнопок удаления
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteButtonClick);
    });
  }

  const searchForm = document.getElementById("search-form");

  // Добавьте обработчик события для формы поиска
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Получите значения из полей поиска
    const searchFio = searchFioInput.value.trim();
    const searchFaculty = searchFacultyInput.value.trim();
    const searchYearOfAdmission = searchYearOfAdmissionInput.value.trim();
    const searchYearOfGraduation = searchYearOfGraduationInput.value.trim();

    // Функция поиска с передачей введенных значений
    searchStudents(
      searchFio,
      searchFaculty,
      searchYearOfAdmission,
      searchYearOfGraduation
    );
  });

  // Функция для сохранения данных студента в localStorage
  function updateLocalStorage() {
    const facultyName = facultyInput.value; // Получите название факультета

    const studentInput = {
      name: nameInput.value,
      surename: surenameInput.value,
      middlname: middlnameInput.value,
      birthdate: birthdateInput.value,
      yearsStartStudy: yearsStartStudyInput.value,
      faculty: facultyName, // Сохраните название факультета
    };

    // Преобразуем объект студента в строку JSON
    const studentData = JSON.stringify(studentInput);

    // Сохраняем данные в localStorage
    localStorage.setItem("studentObj", studentData);
  }

  // Обработчик события отправки формы
  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
    // ...
  });

  // Получаем элементы полей формы
  const nameInput = document.getElementById("name");
  const surenameInput = document.getElementById("surename");
  const middlnameInput = document.getElementById("middlname");
  const birthdateInput = document.getElementById("birthdate");
  const yearsStartStudyInput = document.getElementById("years-start-study");
  const facultyInput = document.getElementById("faculty");

  // Проверяем, есть ли данные в localStorage, и если есть, парсим их
  if (students.length === 0) {
    // Добавляем студента по умолчанию для отображения данных
    students.push({
      name: "Евгений",
      surename: "Ботнарь",
      middlname: "Викторович",
      birthdate: "01.01.2000",
      yearsStartStudy: "2019",
      faculty: "Факультет информатики",
    });
    // Обновляем данные в localStorage
    localStorage.setItem("studentObj", JSON.stringify(students));
  }

  // Добавляем слушатели события input для каждого поля
  nameInput.addEventListener("input", updateLocalStorage);
  surenameInput.addEventListener("input", updateLocalStorage);
  middlnameInput.addEventListener("input", updateLocalStorage);
  birthdateInput.addEventListener("input", updateLocalStorage);
  yearsStartStudyInput.addEventListener("input", updateLocalStorage);
  facultyInput.addEventListener("input", updateLocalStorage);

  // Функция для отображения студентов
  function displayStudents() {
    const tableBody = document.getElementById("student-upload");
    tableBody.innerHTML = ""; // Очищаем текущее содержимое tbody

    students.forEach((student, index,) => {
      const age = calculateAge(student.birthdate); // Вычисляем возраст

      // Определяем год окончания обучения (через 4 года)
      const startYear = parseInt(student.yearsStartStudy);
      const endYear = startYear + 4;

      // Получаем текущий год
      const currentYear = new Date().getFullYear();

      // Определяем номер курса или "закончил"
      let courseInfo = "";
      if (currentYear > endYear) {
        courseInfo = "закончил";
      } else {
        const course = currentYear - startYear + 1;
        courseInfo = `${course} курс`;
      }


      // Получаем название факультета из объекта студента
      let faculty = student.faculty;

      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${student.name} ${student.surename} ${student.middlname}</td>
              <td>${faculty}</td>
              <td>${student.birthdate} (${age} лет)</td>
              <td>${startYear}-${endYear} (${courseInfo})</td>
              <td>
                  <button class="btn btn-danger delete-button" data-index="${index}">Удалить</button>
              </td>
          `;

      tableBody.appendChild(row);
    });

    // Добавляем обработчик события для кнопок удаления
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteButtonClick);
    });
  }

 // Обработчик события для кнопок удаления
function handleDeleteButtonClick(event) {
  const index = event.target.dataset.index; // Получаем индекс студента в массиве
  const studentToDelete = students[index]; // Получаем студента, которого нужно удалить

  // Вызываем функцию для удаления студента с сервера
  serverDeleteStudent(studentToDelete.id) // Передаем идентификатор студента
    .then((data) => {
      // Удаляем студента из массива
      students.splice(index, 1);

      // Обновляем данные в localStorage
      localStorage.setItem("studentObj", JSON.stringify(students));

      // После удаления студента обновляем отображение
      displayStudents();
    })
    .catch((error) => {
      console.error("Ошибка при удалении студента с сервера: " + error);
    });
  }

  // Добавляем обработчик события для кнопок удаления
const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteButtonClick);
})


  // Обработчик события отправки формы
document.getElementById("form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Предотвращаем стандартное поведение формы

  // Получаем значения из полей ввода
  const name = nameInput.value.trim();
  const surename = surenameInput.value.trim();
  const middlname = middlnameInput.value.trim();
  const birthdate = birthdateInput.value.trim();
  const yearsStartStudy = yearsStartStudyInput.value.trim();
  const faculty = facultyInput.value.trim();

  // Проверяем, что все поля заполнены
  if (!name || !surename || !middlname || !birthdate || !yearsStartStudy || !faculty) {
      // Если хотя бы одно поле не заполнено, выводим сообщение об ошибке
      alert("Пожалуйста, заполните все поля перед добавлением студента.");
      return;
  }

  // Создаем объект для нового студента на основе введенных данных
  const newStudent = {
      name,
      surename,
      middlname,
      birthdate,
      yearsStartStudy,
      faculty: faculties[facultyInput.value],
  };

  // Очищаем поля ввода после добавления студента
  nameInput.value = "";
  surenameInput.value = "";
  middlnameInput.value = "";
  birthdateInput.value = "";
  yearsStartStudyInput.value = "";
  facultyInput.value = "";

  let serverDataObj = await serverAddStudent(newStudent);

  // Добавляем нового студента в массив students
  if (Array.isArray(students)) {
      students.push(newStudent);
  } else {
      // Если students не является массивом, создаем новый массив и добавляем студента
      students = [serverDataObj];
  }

  // Обновляем данные в localStorage
  localStorage.setItem("studentObj", JSON.stringify(students));

  // Вызываем функцию для отображения студентов
  displayStudents();
});

    serverGetStudents().then(data => {
      students = data;
      displayStudents();
    })

    // Добавьте обработчик события для заголовка столбца "Имя"
const nameHeader = document.getElementById("student-name");
nameHeader.addEventListener("click", function () {
  // Определите порядок сортировки (по возрастанию или убыванию)
  const sortOrder = this.dataset.sortOrder || "asc";

  // Измените порядок сортировки на противоположный
  const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  this.dataset.sortOrder = newSortOrder;

  // Сортируйте список студентов по имени и порядку сортировки
  students.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (newSortOrder === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  // Перерисуйте таблицу с отсортированным списком студентов
  displayStudents();
});

const facultyHeader = document.getElementById("student-facultet");
facultyHeader.addEventListener("click", function () {
  const sortOrder = this.dataset.sortOrder || "asc";
  const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  this.dataset.sortOrder = newSortOrder;

  students.sort((a, b) => {
    const facultyA = a.faculty.toLowerCase();
    const facultyB = b.faculty.toLowerCase();

    if (newSortOrder === "asc") {
      return facultyA.localeCompare(facultyB);
    } else {
      return facultyB.localeCompare(facultyA);
    }
  });

  displayStudents();
});

const birthdateHeader = document.getElementById("student-birthdate");
birthdateHeader.addEventListener("click", function () {
  const sortOrder = this.dataset.sortOrder || "asc";
  const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  this.dataset.sortOrder = newSortOrder;

  students.sort((a, b) => {
    const dateA = new Date(a.birthdate);
    const dateB = new Date(b.birthdate);

    if (newSortOrder === "asc") {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  displayStudents();
});

const startYearHeader = document.getElementById("student-years");
startYearHeader.addEventListener("click", function () {
  const sortOrder = this.dataset.sortOrder || "asc";
  const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
  this.dataset.sortOrder = newSortOrder;

  students.sort((a, b) => {
    const startYearA = parseInt(a.yearsStartStudy);
    const startYearB = parseInt(b.yearsStartStudy);

    if (newSortOrder === "asc") {
      return startYearA - startYearB;
    } else {
      return startYearB - startYearA;
    }
  });

  displayStudents();
});
});

// 09.10.2023 22:05
