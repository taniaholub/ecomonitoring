document.addEventListener("DOMContentLoaded", function () {
  fetchAndLoadData();
  loadEnterprises();
  loadPollutants();
  loadPollutantTable();
  loadEnterpriseTable();
});

function fetchAndLoadData() {
  fetch("http://localhost:5000/getAll")
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"]));
}

function loadEnterprises() {
  fetch("http://localhost:5000/getEnterprises")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("object-name-input");
      select.innerHTML = '<option value="">Виберіть підприємство</option>';
      data.forEach((enterprise) => {
        const option = document.createElement("option");
        option.value = enterprise.EnterpriseName;
        option.textContent = enterprise.EnterpriseName;
        select.appendChild(option);
      });
    });
}

function loadPollutants() {
  fetch("http://localhost:5000/getPollutants")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("pollutant-name-input");
      select.innerHTML = '<option value="">Виберіть речовину</option>';
      data.forEach((pollutant) => {
        const option = document.createElement("option");
        option.value = pollutant.PollutantName;
        option.textContent = pollutant.PollutantName;
        select.appendChild(option);
      });
    });
}




document
  .querySelector("table tbody")
  .addEventListener("click", function (event) {
    if (event.target.className === "delete-row-btn") {
      deleteRowById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
      handleEditRow(event.target.dataset.id);
    }
  });

const updateBtn = document.querySelector("#update-row-btn");
const searchBtn = document.querySelector("#search-btn");

// search
searchBtn.onclick = function () {
  const searchField = document.querySelector("#search-input").value; // Поле для введення назви підприємства або речовини
  fetch(`http://localhost:5000/search?query=${searchField}`)
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"])); // Виводимо результати пошуку
};

//sort

// Додаємо подію на кнопки сортування
document.querySelector("#sort-year-btn").onclick = function () {
  fetch(`http://localhost:5000/sort?field=Year`)
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"]));
};

document.querySelector("#sort-emission-btn").onclick = function () {
  fetch(`http://localhost:5000/sort?field=EmissionVolume`)
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"]));
};

document.querySelector("#sort-tax-btn").onclick = function () {
  fetch(`http://localhost:5000/sort?field=TaxSum`)
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"]));
};

//reset
const resetBtn = document.querySelector("#reset-btn");

resetBtn.onclick = function () {
  // Завантажуємо всі дані з бази
  fetch("http://localhost:5000/getAll")
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"])); // Повертаємо початковий вигляд таблиці
  loadPollutantTable();
  loadEnterpriseTable();
};

// edit
function handleEditRow(id) {
  const updateSection = document.querySelector("#update-row-input");
  updateSection.hidden = false;

  // Отримати поточний рядок
  const row = document.querySelector(`button[data-id='${id}']`).closest("tr");

  // Заповнити форму редагування значеннями з таблиці
  document.querySelector("#object-name-input").value =
    row.children[1].textContent;
  document.querySelector("#pollutant-name-input").value =
    row.children[2].textContent;
  document.querySelector("#report-year-input").value =
    row.children[3].textContent;
  document.querySelector("#emission-type-input").value =
    row.children[4].textContent;
  document.querySelector("#emission-volume-input").value =
    row.children[5].textContent;
  document.querySelector("#mass-flow-input").value =
    row.children[6].textContent;
  document.querySelector("#tax-type-input").value =
    row.children[7].textContent;
  document.querySelector("#tax-rate-input").value =
    row.children[8].textContent;
  document.querySelector("#tax-sum-input").value = row.children[9].textContent;

  document.querySelector("#update-row-input").dataset.id = id;
}

updateBtn.onclick = function () {
  if (!validateInputs()) {
    return;
  }

  const updateInfoInput = {
    objectName: document.querySelector("#object-name-input").value,
    pollutantName: document.querySelector("#pollutant-name-input").value,
    reportYear: document.querySelector("#report-year-input").value,
    emissionType: document.querySelector("#emission-type-input").value,
    emissionVolume: document.querySelector("#emission-volume-input").value,
    massFlow: document.querySelector("#mass-flow-input").value,
    airTaxRate: document.querySelector("#tax-type-input").value,
    waterTaxRate: document.querySelector("#tax-rate-input").value,
    taxSum: document.querySelector("#tax-sum-input").value,
  };

  const id = document.querySelector("#update-row-input").dataset.id;

  fetch("http://localhost:5000/update", {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      info: updateInfoInput,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateRowInTable(id, updateInfoInput);
        clearSpecificInputs([
          "object-name-input",
          "pollutant-name-input",
          "report-year-input",
          "emission-type-input",
          "emission-volume-input",
          "mass-flow-input",
          "tax-type-input",
          "tax-rate-input",
          "tax-sum-input",
        ]);
        document.querySelector("#update-row-input").hidden = true;
      } else {
        alert("Failed to update: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while updating the row. Please try again.");
    });
};

// Функція для оновлення рядка в таблиці
function updateRowInTable(id, info) {
  const row = document.querySelector(`button[data-id='${id}']`).closest("tr");
  if (row) {
    row.children[1].textContent = info.objectName;
    row.children[2].textContent = info.pollutantName;
    row.children[3].textContent = info.reportYear;
    row.children[4].textContent = info.emissionType;
    row.children[5].textContent = info.emissionVolume;
    row.children[6].textContent = info.massFlow;
    row.children[7].textContent = info.taxType;
    row.children[8].textContent = info.taxRate;
    row.children[9].textContent = info.taxSum;
  }
}

// Функція для очищення всіх полів форми
function clearFormInputs(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
  }
}

// Функція для очищення конкретних полів за їх ідентифікаторами
function clearSpecificInputs(inputIds) {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    }
  });
}

// add

function validateInputs() {
  const objectNameInput = document.querySelector("#object-name-input").value;
  const pollutantNameInput = document.querySelector(
    "#pollutant-name-input"
  ).value;
  const reportYearInput = document.querySelector("#report-year-input").value;
  const emissionVolumeInput = document.querySelector(
    "#emission-volume-input"
  ).value;
  const massFlowInput = document.querySelector("#mass-flow-input").value;

  const currentYear = new Date().getFullYear();

  if (!objectNameInput) {
    alert("Будь ласка, виберіть підприємство.");
    return false;
  }

  if (!pollutantNameInput) {
    alert("Будь ласка, виберіть забруднюючу речовину.");
    return false;
  }

  if (parseInt(reportYearInput, 10) > currentYear) {
    alert(`Рік звітності не може бути більшим за ${currentYear}`);
    return false;
  }

  if (parseFloat(emissionVolumeInput) <= 0) {
    alert("Об'єм викидів повинен бути більше нуля.");
    return false;
  }

  if (parseFloat(massFlowInput) <= 0) {
    alert("Масова витрата повинна бути більше нуля.");
    return false;
  }

  return true;
}


// Показувати/ховати додаткові поля в залежності від вибору типу податку
document.querySelector("#tax-type-input").addEventListener("change", function () {
  const emissionType = this.value;

  const waterWasteFields = document.getElementById("water-waste-fields");
  const wasteDisposalFields = document.getElementById("waste-disposal-fields");
  const radioactiveFields = document.getElementById("radioactive-fields");
  const radioactWasteStorFields = document.getElementById("radioact-waste-stor-fields");
  const taxRateInput = document.getElementById("tax-rate-input");

  if (emissionType === "Викиди у водні об'єкти") {
    waterWasteFields.style.display = "block"; 
  } else {
    waterWasteFields.style.display = "none";  
  }

  if (emissionType === "За розміщення відходів") {
    wasteDisposalFields.style.display = "block"; 
  } else {
    wasteDisposalFields.style.display = "none";  
  }

  if (emissionType === "Утворення радіоактивних відходів") {
    radioactiveFields.style.display = "block"; 
    taxRateInput.style.display = "none"; 
  } else {
    radioactiveFields.style.display = "none"; 
    taxRateInput.style.display = "block"; 
  }

  if (emissionType === "Зберігання радіоактивних відходів") {
    radioactWasteStorFields.style.display = "block"; 
  } else {
    radioactWasteStorFields.style.display = "none";  
  }
});


const addBtn = document.querySelector("#add-info-btn");

addBtn.onclick = function () {
  if (!validateInputs()) {
    return;
  }

  const emissionType = document.querySelector("#tax-type-input").value;
  const emissionVolume = parseFloat(document.querySelector("#emission-volume-input").value);
  
  let taxRate = null;
  let taxSum = 0; // Variable to store the calculated tax sum
  
  // Calculate tax based on the type of emission
  switch (emissionType) {
    case "Викиди в атмосферне повітря":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      taxSum = emissionVolume * taxRate;
      break;
      
    case "Викиди у водні об'єкти":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      const correctionCoeff = parseFloat(document.querySelector("#correc-coeff-input").value);
      taxSum = emissionVolume * taxRate * correctionCoeff;
      break;
      
    case "За розміщення відходів":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      const wasteDisposalCoeff = parseFloat(document.querySelector("#waste-disposal-coeff").value);
      taxSum = emissionVolume * taxRate * wasteDisposalCoeff;
      break;
      
    case "Утворення радіоактивних відходів":
      const H = 0.0133; // Ставка податку за утворення радіоактивних відходів виробниками електричної енергії
      taxRate = H; // Ставка податку в цьому випадку буде =  H

      const On = parseFloat(document.querySelector("#energy-input").value); // отримуємо введені дані
      const wasteCoeff = parseFloat(document.querySelector("#waste-coeff-input").value); // отримуємо коефіцієнт
      const storageCost = parseFloat(document.querySelector("#storage-cost-input").value); // отримуємо собівартість зберігання
      const storageCostBef2009 = parseFloat(document.querySelector("#storage-cost-before-2009").value); // отримуємо собівартість зберігання до 1 квітня 2009
      const accumulatedWasteVolume = parseFloat(document.querySelector("#accumulated-waste-volume").value); // V2 Об'єм високоактивних радіоактивних відходів, накопичених у сховищах організацій до 1 квітня 2009

      taxSum = On * H + (wasteCoeff * storageCost * emissionVolume) + 1/32 * (wasteCoeff * storageCostBef2009 * accumulatedWasteVolume) ; 
      break;
      
    case "Зберігання радіоактивних відходів":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      // T - кількість повних календарних кварталів, протягом яких радіоактивні відходи зберігаються понад установлений особливими умовами ліцензії строк.
      const radioactWasteStorCoeff = parseFloat(document.querySelector("#radioact-waste-stor-coeff").value); 

      taxSum = emissionVolume * taxRate * radioactWasteStorCoeff;
      break;
    
    default:
      alert("Будь ласка, виберіть правильний тип податку.");
      return;
  }

  document.querySelector("#tax-sum-input").value = taxSum.toFixed(2); // Показати обраховану суму податку

  const info = {
    objectName: document.querySelector("#object-name-input").value,
    pollutantName: document.querySelector("#pollutant-name-input").value,
    reportYear: document.querySelector("#report-year-input").value,
    emissionType: document.querySelector("#emission-type-input").value,
    emissionVolume: emissionVolume,
    massFlow: document.querySelector("#mass-flow-input").value,
    taxType: emissionType,
    taxRate: taxRate,
    taxSum: taxSum.toFixed(2),
  };

  // Очищуємо форму після додавання
  clearSpecificInputs([
    "object-name-input",
    "pollutant-name-input",
    "report-year-input",
    "emission-type-input",
    "emission-volume-input",
    "mass-flow-input",
    "tax-type-input",
    "tax-rate-input",
    "tax-sum-input",
  ]);

  fetch("http://localhost:5000/insert", {
    headers: {
      "Content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ info: info }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.data) {
        insertRowIntoTable(data.data);
      } else {
        console.error("Unexpected data structure:", data);
      }
    });
};


// insert new info into table
function insertRowIntoTable(data) {
  if (!data) {
    console.error("No data provided to insertRowIntoTable");
    return;
  }

  const table = document.querySelector("table tbody");
  const isTableData = table.querySelector(".no-data");

  let tableHtml = "<tr>";
  tableHtml += `<td>${data.id}</td>`; // Колонка з "№"
  tableHtml += `<td>${data.objectName}</td>`;
  tableHtml += `<td>${data.pollutantName}</td>`;
  tableHtml += `<td>${data.reportYear}</td>`;
  tableHtml += `<td>${data.emissionType}</td>`;
  tableHtml += `<td>${data.emissionVolume}</td>`;
  tableHtml += `<td>${data.massFlow}</td>`;
  tableHtml += `<td>${data.taxType}</td>`;
  tableHtml += `<td>${data.taxRate}</td>`;
  tableHtml += `<td>${data.taxSum}</td>`;
  tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</button></td>`; // кнопки видалення та редагування
  tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</button></td>`;
  tableHtml += "</tr>";

  // Оновлення таблиці
  if (isTableData) {
    table.innerHTML = tableHtml;
  } else {
    const newRow = table.insertRow();
    newRow.innerHTML = tableHtml;
  }
}

function loadHTMLTable(data) {
  const table = document.querySelector("table tbody");

  if (data.length === 0) {
    table.innerHTML = "<tr><td class='no-data' colspan='12'>No Data</td></tr>";
    return;
  }

  let tableHtml = "";

  data.forEach(function ({
    idReport,
    EnterpriseName,
    PollutantName,
    Year,
    EmissionType,
    EmissionVolume,
    MassFlow,
    TaxType,
    TaxRate,
    TaxSum,
  }) {
    tableHtml += "<tr>";
    tableHtml += `<td>${idReport}</td>`;
    tableHtml += `<td>${EnterpriseName}</td>`;
    tableHtml += `<td>${PollutantName}</td>`;
    tableHtml += `<td>${Year}</td>`;
    tableHtml += `<td>${EmissionType}</td>`;
    tableHtml += `<td>${EmissionVolume}</td>`;
    tableHtml += `<td>${MassFlow}</td>`;
    tableHtml += `<td>${TaxType}</td>`;
    tableHtml += `<td>${TaxRate}</td>`;
    tableHtml += `<td>${TaxSum}</td>`;
    tableHtml += `<td><button class="delete-row-btn" data-id=${idReport}>Delete</button></td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${idReport}>Edit</button></td>`;
    tableHtml += "</tr>";
  });

  table.innerHTML = tableHtml;
}

function loadPollutantTable() {
  fetch("http://localhost:5000/getAllPollutants")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#pollutantTable tbody");
      tbody.innerHTML = ""; // Clear before filling
      data.forEach((pollutant, index) => {
        const row = `<tr>
          <td>${index + 1}</td>
          <td>${pollutant.PollutantName}</td>
          <td>${pollutant.HazardClass}</td>
          <td>${pollutant.MPC}</td>
          <td><button class="delete-btn" onclick="deletePollutant(${
            pollutant.idPollutant
          })">Видалити</button></td>
        </tr>`;
        tbody.innerHTML += row;
      });
    });
}

function loadEnterpriseTable() {
  fetch("http://localhost:5000/getAllEnterprises")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#enterpriseTable tbody");
      tbody.innerHTML = ""; // Clear before filling
      data.forEach((enterprise, index) => {
        const row = `<tr>
          <td>${index + 1}</td>
          <td>${enterprise.EnterpriseName}</td>
          <td>${enterprise.Address}</td>
          <td>${enterprise.ActivityType}</td>
          <td><button class="delete-btn" onclick="deleteEnterprise(${
            enterprise.idEnterprise
          })">Видалити</button></td>
        </tr>`;
        tbody.innerHTML += row;
      });
    });
}

function deletePollutant(id) {
  fetch(`http://localhost:5000/deletePollutant/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Речовину видалено!");
        loadPollutantTable(); // Перезавантажуємо таблицю речовин
      } else {
        alert("Не вдалося видалити речовину.");
      }
    })
    .catch((error) => console.error("Error deleting pollutant:", error));
}

function deleteEnterprise(id) {
  fetch(`http://localhost:5000/deleteEnterprise/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Підприємство видалено!");
        loadEnterpriseTable(); // Перезавантажуємо таблицю підприємств
      } else {
        alert("Не вдалося видалити підприємство.");
      }
    })
    .catch((error) => console.error("Error deleting enterprise:", error));
}

// Додавання нового підприємства
document
  .querySelector("#enterprise-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newEnterprise = {
      name: document.querySelector("#new-enterprise-name").value,
      address: document.querySelector("#new-enterprise-address").value,
      activityType: document.querySelector("#new-enterprise-activity").value,
    };

    fetch("http://localhost:5000/addEnterprise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEnterprise),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Підприємство додано!");
          clearFormInputs("enterprise-form"); // Очищуємо поля
          loadEnterpriseTable(); // Перезавантажуємо таблицю підприємств
        } else {
          alert("Не вдалося додати підприємство.");
        }
      })
      .catch((error) => console.error("Error adding enterprise:", error));
  });

// Додавання нової речовини
document
  .querySelector("#pollutant-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const newPollutant = {
      name: document.querySelector("#new-pollutant-name").value,
      hazardClass: document.querySelector("#new-hazard-class").value,
      mpc: document.querySelector("#new-mpc").value,
    };

    fetch("http://localhost:5000/addPollutant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPollutant),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Речовину додано!");
          clearFormInputs("pollutant-form"); // Очищуємо поля
          loadPollutantTable(); // Перезавантажуємо таблицю речовин
        } else {
          alert("Не вдалося додати речовину.");
        }
      })
      .catch((error) => console.error("Error adding pollutant:", error));
  });

//delete
// Функція для видалення рядка за ID
function deleteRowById(id) {
  console.log("Deleting row with ID:", id);
  fetch("http://localhost:5000/delete/" + id, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        location.reload();
      } else {
        console.error("Failed to delete:", data);
      }
    })
    .catch((error) => console.error("Error in deleteRowById:", error));
}
