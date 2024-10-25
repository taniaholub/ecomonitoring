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
  document.querySelector("#emission-volume-input").value =
    row.children[4].textContent;
  document.querySelector("#mass-flow-input").value =
    row.children[5].textContent;
  document.querySelector("#compound-concentr-input").value =
    row.children[6].textContent;
  document.querySelector("#hq-input").value = row.children[7].textContent;
  document.querySelector("#cr-input").value = row.children[8].textContent;
  document.querySelector("#tax-type-input").value = row.children[9].textContent;
  document.querySelector("#tax-rate-input").value =
    row.children[10].textContent;
  document.querySelector("#tax-sum-input").value = row.children[11].textContent;
  document.querySelector("#damages-input").value = row.children[12].textContent;

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
    emissionVolume: document.querySelector("#emission-volume-input").value,
    massFlow: document.querySelector("#mass-flow-input").value,
    concentration: document.querySelector("#compound-concentr-input").value,
    hq: document.querySelector("#hq-input").value,
    cr: document.querySelector("#cr-input").value,
    taxType: document.querySelector("#tax-type-input").value,
    taxRate: document.querySelector("#tax-rate-input").value,
    taxSum: document.querySelector("#tax-sum-input").value,
    damages: document.querySelector("#damages-input").value,
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
        clearFormInputs("enterprise-form");
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
    row.children[4].textContent = info.emissionVolume;
    row.children[5].textContent = info.massFlow;
    row.children[6].textContent = info.concentration;
    row.children[7].textContent = info.hq;
    row.children[8].textContent = info.cr;
    row.children[9].textContent = info.taxType;
    row.children[10].textContent = info.taxRate;
    row.children[11].textContent = info.taxSum;
    row.children[11].textContent = info.damages;
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
  const currentYear = new Date().getFullYear();

  // Функція для перевірки видимості поля
  const isVisible = (element) => {
    return element && element.offsetParent !== null;
  };

  // Масив полів з відповідними повідомленнями
  const fields = [
    {
      input: "#object-name-input",
      message: "Будь ласка, виберіть підприємство.",
    },
    {
      input: "#pollutant-name-input",
      message: "Будь ласка, виберіть забруднюючу речовину.",
    },
    {
      input: "#report-year-input",
      validate: (value) => parseInt(value, 10) <= currentYear,
      message: `Рік звітності не може бути більшим за ${currentYear}`,
    },
    {
      input: "#emission-volume-input",
      validate: (value) => parseFloat(value) > 0,
      message: "Об'єм викидів повинен бути більше нуля.",
    },
    {
      input: "#mass-flow-input",
      validate: (value) => parseFloat(value) > 0,
      message: "Масова витрата повинна бути більше нуля.",
    },
    {
      input: "#energy-input",
      validate: (value) => parseFloat(value) > 0,
      message: "Обсяг електричної енергії повинний бути більше нуля.",
    },
    {
      input: "#storage-cost-input",
      validate: (value) => parseFloat(value) > 1000,
      message: "Собівартість зберігання повинна бути більше 1000.",
    },
    {
      input: "#storage-cost-before-2009",
      validate: (value) => parseFloat(value) > 1000,
      message: "Собівартість зберігання повинна бути більше 1000.",
    },
    {
      input: "#tax-rate-input",
      validate: (value) => parseFloat(value) > 0,
      message: "Ставка податку повинна бути більше нуля.",
    },
    {
      input: "#radioact-waste-stor-coeff",
      validate: (value) => parseFloat(value) >= 0,
      message: "Кількість календарних кварталів не може бути від'ємною.",
    },
    {
      input: "#emission-time-input",
      validate: (value) => parseFloat(value) >= 0,
      message:
        "Час роботи джерела викиду забруд. речовини в режимі надмірного викиду повиннен бути більше нуля.",
    },
    {
      input: "#emmission-standard-input",
      validate: (value) => parseFloat(value) > 0,
      message:
        "Значення затвердженого нормативу викиду речовини повинне бути більше нуля.",
    },
    {
      input: "#Q-input",
      validate: (value) => parseFloat(value) >= 0,
      message:
        "Фактичні витрати зворотних вод не можуть бути від'ємними.",
    },
    {
      input: "#Y-input",
      validate: (value) => parseFloat(value) > 0,
      message:
        "Проіндексований питомий економ. збиток повиннен бути більше нуля.",
    },
  ];

  // Перевірка полів
  for (const { input, validate, message } of fields) {
    const element = document.querySelector(input);
    if (isVisible(element)) {
      const value = element.value;
      if (!value || (validate && !validate(value))) {
        alert(message);
        return false;
      }
    }
  }

  return true;
}

// Показувати/ховати додаткові поля в залежності від вибору типу податку
document
  .querySelector("#tax-type-input")
  .addEventListener("change", function () {
    const emissionType = this.value;

    const taxFieldMappings = {
      "Викиди у водні об'єкти": {
        show: ["water-waste-fields"],
        hide: [
          "waste-disposal-fields",
          "radioactive-fields",
          "radioact-waste-stor-fields",
          "tax-rate-input",
        ],
      },
      "За розміщення відходів": {
        show: ["waste-disposal-fields"],
        hide: [
          "water-waste-fields",
          "radioactive-fields",
          "radioact-waste-stor-fields",
          "tax-rate-input",
        ],
      },
      "Утворення радіоактивних відходів": {
        show: ["radioactive-fields"],
        hide: [
          "water-waste-fields",
          "waste-disposal-fields",
          "radioact-waste-stor-fields",
        ],
        hideTax: true,
      },
      "Зберігання радіоактивних відходів": {
        show: ["radioact-waste-stor-fields"],
        hide: [
          "water-waste-fields",
          "waste-disposal-fields",
          "radioactive-fields",
          "tax-rate-input",
        ],
      },
    };

    const fields = taxFieldMappings[emissionType] || {
      show: [],
      hide: [
        "water-waste-fields",
        "waste-disposal-fields",
        "radioactive-fields",
        "radioact-waste-stor-fields",
      ],
    };

    // Показати вибрані поля
    fields.show.forEach(
      (id) => (document.getElementById(id).style.display = "block")
    );

    // Сховати решту полів
    fields.hide.forEach(
      (id) => (document.getElementById(id).style.display = "none")
    );

    // Показати або сховати поле для ставки податку
    const taxRateInput = document.getElementById("tax-rate-input");
    if (fields.hideTax) {
      taxRateInput.style.display = "none";
    } else {
      taxRateInput.style.display = "block";
    }
  });

  // Показувати/ховати додаткові поля в залежності від вибору типу відшкодування збитків 
document.querySelector("#damage-type-input").addEventListener("change", function () {
  const damageType = this.value;

  const damageFieldMappings = {
    "Відшкодування збитків за викиди в атмосферне повітря": {
      show: ["air-damage-fields"],
      hide: ["water-damage-fields"],
    },
    "Відшкодування збитків за викиди у водні об'єкти": {
      show: ["water-damage-fields"],
      hide: ["air-damage-fields"],
    },
  };

  const fields = damageFieldMappings[damageType] || {
    show: [],
    hide: ["air-damage-fields", "water-damage-fields"],
  };

  // Показати вибрані поля
  fields.show.forEach((id) => (document.getElementById(id).style.display = "block"));

  // Сховати решту полів
  fields.hide.forEach((id) => (document.getElementById(id).style.display = "none"));
});

const addBtn = document.querySelector("#add-info-btn");

addBtn.onclick = function () {
  if (!validateInputs()) {
    return;
  }

  // обрахування податку
  const emissionType = document.querySelector("#tax-type-input").value;
  const emissionVolume = parseFloat(
    document.querySelector("#emission-volume-input").value
  );

  let taxRate = null;
  let taxSum = 0;

  // Calculate tax based on the type of emission
  switch (emissionType) {
    case "Викиди в атмосферне повітря":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      taxSum = emissionVolume * taxRate;
      break;

    case "Викиди у водні об'єкти":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      const correctionCoeff = parseFloat(
        document.querySelector("#correc-coeff-input").value
      );
      taxSum = emissionVolume * taxRate * correctionCoeff;
      break;

    case "За розміщення відходів":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      const wasteDisposalCoeff = parseFloat(
        document.querySelector("#waste-disposal-coeff").value
      );
      taxSum = emissionVolume * taxRate * wasteDisposalCoeff;
      break;

    case "Утворення радіоактивних відходів":
      const H = 0.0133; // Ставка податку за утворення радіоактивних відходів виробниками електричної енергії
      taxRate = H; // Ставка податку в цьому випадку буде =  H

      const On = parseFloat(document.querySelector("#energy-input").value); // отримуємо введені дані
      const wasteCoeff = parseFloat(
        document.querySelector("#waste-coeff-input").value
      ); // отримуємо коефіцієнт
      const storageCost = parseFloat(
        document.querySelector("#storage-cost-input").value
      ); // отримуємо собівартість зберігання
      const storageCostBef2009 = parseFloat(
        document.querySelector("#storage-cost-before-2009").value
      ); // отримуємо собівартість зберігання до 1 квітня 2009
      const accumulatedWasteVolume = parseFloat(
        document.querySelector("#accumulated-waste-volume").value
      ); // V2 Об'єм високоактивних радіоактивних відходів, накопичених у сховищах організацій до 1 квітня 2009

      taxSum =
        On * H +
        wasteCoeff * storageCost * emissionVolume +
        (1 / 32) * (wasteCoeff * storageCostBef2009 * accumulatedWasteVolume);
      break;

    case "Зберігання радіоактивних відходів":
      taxRate = parseFloat(document.querySelector("#tax-rate-input").value);
      // T - кількість повних календарних кварталів, протягом яких радіоактивні відходи зберігаються понад установлений особливими умовами ліцензії строк.
      const radioactWasteStorCoeff = parseFloat(
        document.querySelector("#radioact-waste-stor-coeff").value
      );

      taxSum = emissionVolume * taxRate * radioactWasteStorCoeff;
      break;

    default:
      alert("Будь ласка, виберіть правильний тип податку.");
      return;
  }
  document.querySelector("#tax-sum-input").value = taxSum.toFixed(2); // Показати обраховану суму податку

  // обрахування ризику для здоров'я
  const concentration = parseFloat(
    document.querySelector("#compound-concentr-input").value
  );
  const pollutantName = document.querySelector("#pollutant-name-input").value;

  if (!concentration || !pollutantName) {
    alert("Будь ласка, введіть концентрацію та виберіть речовину.");
    return;
  }

  // Отримуємо значення sf та rfc для вибраної речовини
  fetch(`http://localhost:5000/getPollutantFactors?name=${pollutantName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Отримані дані про речовину:", data);

      // Перевіряємо наявність даних
      if (!data || typeof data !== "object") {
        throw new Error("Невірний формат даних від сервера");
      }

      const SF = parseFloat(data.SF) || 0;
      const RFC = parseFloat(data.RFC) || 0;
      const mpc = parseFloat(data.MPC) || 0;

      // Перевірка чи хоча б одне значення присутнє
      if (RFC === 0 && SF === 0) {
        alert(
          "Увага: Для цієї речовини відсутні значення SF та RFC. Ризики будуть розраховані як 0."
        );
      }

      function calculateHealthRisk(concentration, SF, RFC) {
        const CR = 20; // швидкість надходження повітря до організму
        const EF = 350; // частота впливу, днів на рік
        const ED = 70; // тривалість впливу, років
        const BW = 70; // середня маса тіла людини
        const AT = 70; // період усереднення експозиції, років

        const ladd = (concentration * CR * EF * ED) / (BW * AT * 365);
        const hq = RFC > 0 ? ladd / RFC : 0; // Перевіряємо RFC перед діленням
        const cr = SF > 0 ? ladd * SF : 0;

        return { hq, cr, ladd };
      }

      const { hq, cr, ladd } = calculateHealthRisk(concentration, SF, RFC);

      // Виводимо результати в приховані поля форми
      document.querySelector("#hq-input").value = hq.toFixed(4);
      document.querySelector("#cr-input").value = cr.toFixed(5);

      alert(
        `Ladd: ${ladd.toFixed(6)}, HQ: ${hq.toFixed(2)}, CR: ${cr.toFixed(2)}`
      );

      // обрахунок розмірів відшкодування збитків
      const qmi = parseFloat(document.querySelector("#mass-flow-input").value); // середнє арифметичне значення результатів вимірювань масової витрати
      const qnorm = parseFloat(document.querySelector("#emmission-standard-input").value); // затверджений норматив викиду
      const t = parseFloat(document.querySelector("#emission-time-input").value); //тривалість скидання забруднюючих речовин з порушенням норм ГДК
      const Q = parseFloat(document.querySelector("#Q-input").value); 
      const Y = parseFloat(document.querySelector("#Y-input").value); // проіндексований питомий економ. збиток від забруднення вод.ресурсів у поточному році. 

      function GetMi(qmi, qnorm, t) {
        console.log("Значення змінних для обрахунку damages", {
          qmi,
          qnorm,
          t,
        });
        return 3.6 * Math.pow(10, -3) * (qmi - qnorm) * t;
        
      }

      function calculateAi(mpc) {
        if (mpc > 1) {
          return 10 / mpc;
        } else if (mpc <= 0) {
          return 500;
        } else {
          return 1 / mpc;
        }
      }

      function GetDamages(concentration, mpc) {
        // mpc - це гдк
        const minWage = 1.1 * 6700;
        const Ai = calculateAi(mpc);
        let Knas = 1.8; // коефіцієнт залежить від чисельності населення, стала
        let Kf = 1.65; // коефіцієнт враховує народогосподарське населення, стала
        let Kt = Knas * Kf; // коефіцієнт, що враховує територіальні соціально-економічні особливості
        let Kzi = concentration > 0 && mpc > 0 && mpc != 0 ? concentration / mpc : 1; // коефіцієнт, що залежить від рівня забрутнення атмосферного повітря
        const Mi = GetMi(qmi, qnorm, t);
        let damages = Mi * minWage * Ai * Kt * Kzi;

        alert(
          `Mi: ${Mi.toFixed(4)}, Knas: ${Knas.toFixed(2)}, Kf: ${Kf.toFixed(2)}, Kt: ${Kt.toFixed(2)},
           Kzi: ${Kzi.toFixed(3)}, Ai: ${Ai.toFixed(3)}, minWage: ${minWage.toFixed(2)}}`
        );

        // прибрати пізніше
        console.log("Значення змінних для обрахунку damages", {
          Mi,
          minWage,
          Ai,
          Kt,
          Kzi,
          qmi,
          qnorm,
        });

        return damages;
      }

      function GetMiWater(concentration, mpc, t, Q){
        let MiW = 1;
        // MiW = (Cif - Cid) * Q * t * Math.pow(10, -6) // в тоннах
        //Сіф = concentration - середня фактична концентрація, г/м^3
        //Сід = mpc - дозволена для скиду концентрація(гдк), 
        // Q - фактичні витрати зворотних вод, м^3/год. Ввід користувача
        // t - тривалість скидання забруднюючих речовин з порушенням норм ГДК, год
        MiW = (concentration - mpc) * Q * t * Math.pow(10, -6);
        return MiW;
      }

      function GetWaterDamages(concentration, mpc, Y) {
        // З = Кат * Кр * Кз * Мі * Yi
        let Kat = 1.5; // коефіцієнт, що враховує категорію водного об'єкта, стала
        let Kr = 1.21; // регіональний коефіцієнт дефіцитності водних ресурсів поверхневих вод, стала
        let Kz = 1.5; // коефіцієнт ураженості водної екосистеми, стала
        const Ai = calculateAi(mpc);
        const MiW = GetMiWater(concentration, mpc, t, Q); // маса наднормативного скиду забруд. реч. у водний об'єкт
        let Yi = Y * Ai;

        let damages = Kat * Kr * Kz * MiW * Yi;
        alert(
          `З = Кат * Кр * Кз * Мі * Yi, 
           MiW: ${MiW.toFixed(4)}, Kat: ${Kat.toFixed(2)}, Kr: ${Kr.toFixed(2)}, Kz: ${Kz.toFixed(2)},
           Yi: ${Yi.toFixed(3)}, Ai: ${Ai.toFixed(3)}}`
        );
        return damages;
      }

      const damageType = document.querySelector("#damage-type-input").value;

      let damages = 0;

      switch (damageType) {
        case "Відшкодування збитків за викиди в атмосферне повітря":
          damages = GetDamages(concentration, mpc);
          break;
      
        case "Відшкодування збитків за викиди у водні об'єкти":
          damages = GetWaterDamages(concentration, mpc, Y);
          break;
      
        default:
          alert("Оберіть правильний тип відшкодування збитків.");
          return;
      }
      document.querySelector("#damages-input").value = damages.toFixed(4);


      // Додавання даних до таблиці Report
      const info = {
        objectName: document.querySelector("#object-name-input").value,
        pollutantName: pollutantName,
        reportYear: document.querySelector("#report-year-input").value,
        emissionVolume: parseFloat(
          document.querySelector("#emission-volume-input").value
        ),
        massFlow: parseFloat(document.querySelector("#mass-flow-input").value),
        concentration: concentration,
        hq: hq.toFixed(4),
        cr: cr.toFixed(5),
        taxType: emissionType,
        taxRate: taxRate,
        taxSum: taxSum.toFixed(2),
        damages: damages.toFixed(4),
      };

      // Надсилаємо дані на сервер для вставки в базу
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
          // console.log("Received data:", data);
          if (data && data.data) {
            insertRowIntoTable(data.data);
          } else {
            console.error("Unexpected data structure:", data);
          }
        })
        .then(() => {
          clearFormInputs("report-form");
        });
    })
    .catch((error) => {
      console.error("Помилка при отриманні даних про речовину:", error);
    });
};

// Функція для визначення кольору NonCarcinogenRisk
function getNonCarcinogenRiskColor(value) {
  if (value < 1) {
    return "green";
  } else if (value === 1) {
    return "yellow";
  } else {
    return "red";
  }
}

// Функція для визначення кольору CarcinogenRisk
function getCarcinogenRiskColor(value) {
  if (value < Math.pow(10, -6)) {
    return "lightblue";
  } else if (value >= Math.pow(10, -6) && value < Math.pow(10, -4)) {
    return "green";
  } else if (value >= Math.pow(10, -4) && value < Math.pow(10, -3)) {
    return "yellow";
  } else {
    return "red";
  }
}

// insert new info into table
function insertRowIntoTable(data) {
  if (!data) {
    console.error("No data provided to insertRowIntoTable");
    return;
  }

  const table = document.querySelector("table tbody");
  const isTableData = table.querySelector(".no-data");

  // Зміна кольору клітинок для HQ та CR
  const hqColor = getNonCarcinogenRiskColor(parseFloat(data.hq));
  const crColor = getCarcinogenRiskColor(parseFloat(data.cr));
  let tableHtml = "<tr>";
  tableHtml += `<td>${data.id}</td>`; // Колонка з "№"
  tableHtml += `<td>${data.objectName}</td>`;
  tableHtml += `<td>${data.pollutantName}</td>`;
  tableHtml += `<td>${data.reportYear}</td>`;
  tableHtml += `<td>${data.emissionVolume}</td>`;
  tableHtml += `<td>${data.massFlow}</td>`;
  tableHtml += `<td>${data.concentration}</td>`;
  tableHtml += `<td style="background-color: ${hqColor}">${data.hq}</td>`;
  tableHtml += `<td style="background-color: ${crColor}">${data.cr}</td>`;
  tableHtml += `<td>${data.taxType}</td>`;
  tableHtml += `<td>${data.taxRate}</td>`;
  tableHtml += `<td>${data.taxSum}</td>`;
  tableHtml += `<td>${data.damages}</td>`;
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
    table.innerHTML = "<tr><td class='no-data' colspan='15'>No Data</td></tr>";
    return;
  }

  let tableHtml = "";

  data.forEach(function ({
    idReport,
    EnterpriseName,
    PollutantName,
    Year,
    EmissionVolume,
    MassFlow,
    CompConcentration,
    NonCarcinogenRisk,
    CarcinogenRisk,
    TaxType,
    TaxRate,
    TaxSum,
    Damages,
  }) {
    const nonCarcinogenColor = getNonCarcinogenRiskColor(NonCarcinogenRisk);
    const carcinogenColor = getCarcinogenRiskColor(CarcinogenRisk);

    tableHtml += "<tr>";
    tableHtml += `<td>${idReport}</td>`;
    tableHtml += `<td>${EnterpriseName}</td>`;
    tableHtml += `<td>${PollutantName}</td>`;
    tableHtml += `<td>${Year}</td>`;
    tableHtml += `<td>${EmissionVolume}</td>`;
    tableHtml += `<td>${MassFlow}</td>`;
    tableHtml += `<td>${CompConcentration}</td>`;
    tableHtml += `<td style="background-color: ${nonCarcinogenColor}">${NonCarcinogenRisk}</td>`;
    tableHtml += `<td style="background-color: ${carcinogenColor}">${CarcinogenRisk}</td>`;
    tableHtml += `<td>${TaxType}</td>`;
    tableHtml += `<td>${TaxRate}</td>`;
    tableHtml += `<td>${TaxSum}</td>`;
    tableHtml += `<td>${Damages}</td>`;
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
          <td>${pollutant.RFC}</td>
          <td>${pollutant.SF}</td>
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
      rfc: document.querySelector("#new-rfc").value,
      sf: document.querySelector("#new-sf").value,
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
          clearFormInputs("pollutant-form");
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
