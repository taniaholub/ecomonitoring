document.addEventListener("DOMContentLoaded", function () {
  fetchAndLoadData();
  loadEnterpriseOptions();
  loadPollutantOptions();
  loadPollutantTable();
  loadEnterpriseTable();
});

function fetchAndLoadData() {
  fetch("http://localhost:5000/getAll")
    .then((response) => response.json())
    .then((data) => loadHTMLTable(data["data"]));
}

function loadEnterpriseOptions() {
  fetch("http://localhost:5000/getEnterprises")
    .then((response) => response.json())
    .then((data) => {
      const select1 = document.getElementById("object-name-input");
      const select2 = document.getElementById("enterprise-name-input");
      if (select1) {
        select1.innerHTML = '<option value="">Виберіть підприємство</option>';
      }
      if (select2) {
        select2.innerHTML = '<option value="">Виберіть підприємство</option>';
      }
      data.forEach((enterprise) => {
        const option = document.createElement("option");
        option.value = enterprise.EnterpriseName;
        option.textContent = enterprise.EnterpriseName;
        if (select1) select1.appendChild(option.cloneNode(true));
        if (select2) select2.appendChild(option);
      });
    });
}

function loadPollutantOptions() {
  fetch("http://localhost:5000/getPollutants")
    .then((response) => response.json())
    .then((data) => {
      const select1 = document.getElementById("pollutant-name-input");
      const select2 = document.getElementById("pollutant-input");
      if (select1) {
        select1.innerHTML = '<option value="">Виберіть речовину</option>';
      }
      if (select2) {
        select2.innerHTML = '<option value="">Виберіть речовину</option>';
      }
      data.forEach((pollutant) => {
        const option = document.createElement("option");
        option.value = pollutant.PollutantName;
        option.textContent = pollutant.PollutantName;
        if (select1) select1.appendChild(option.cloneNode(true));
        if (select2) select2.appendChild(option);
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

  // Get tax calculation inputs
  const emissionType = document.querySelector("#tax-type-input").value;
  const emissionVolume = parseFloat(
    document.querySelector("#emission-volume-input").value
  );
  const taxRate = parseFloat(document.querySelector("#tax-rate-input").value);

  // Additional parameters for tax calculation
  const additionalParams = {
    correctionCoeff: parseFloat(
      document.querySelector("#correc-coeff-input")?.value || 0
    ),
    wasteDisposalCoeff: parseFloat(
      document.querySelector("#waste-disposal-coeff")?.value || 0
    ),
    On: parseFloat(document.querySelector("#energy-input")?.value || 0),
    wasteCoeff: parseFloat(
      document.querySelector("#waste-coeff-input")?.value || 0
    ),
    storageCost: parseFloat(
      document.querySelector("#storage-cost-input")?.value || 0
    ),
    storageCostBef2009: parseFloat(
      document.querySelector("#storage-cost-before-2009")?.value || 0
    ),
    accumulatedWasteVolume: parseFloat(
      document.querySelector("#accumulated-waste-volume")?.value || 0
    ),
    radioactWasteStorCoeff: parseFloat(
      document.querySelector("#radioact-waste-stor-coeff")?.value || 0
    ),
  };

  // Calculate tax
  const taxSum = calculateTax(
    emissionType,
    emissionVolume,
    taxRate,
    additionalParams
  );

  // Get health risk inputs
  const concentration = parseFloat(
    document.querySelector("#compound-concentr-input").value
  );
  const pollutantName = document.querySelector("#pollutant-name-input").value;

  if (!concentration || !pollutantName) {
    alert("Будь ласка, введіть концентрацію та виберіть речовину.");
    return;
  }

  const id = document.querySelector("#update-row-input").dataset.id;

  // Fetch pollutant data and calculate risks
  fetch(`http://localhost:5000/getPollutantFactors?name=${pollutantName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || typeof data !== "object") {
        throw new Error("Невірний формат даних від сервера");
      }

      const SF = parseFloat(data.SF) || 0;
      const RFC = parseFloat(data.RFC) || 0;
      const mpc = parseFloat(data.MPC) || 0;

      if (RFC === 0 && SF === 0) {
        alert(
          "Увага: Для цієї речовини відсутні значення SF та RFC. Ризики будуть розраховані як 0."
        );
      }

      // Calculate health risks
      const { hq, cr } = calculateHealthRisk(concentration, SF, RFC);

      // Calculate damages
      const damageParams = {
        concentration,
        mpc,
        qmi: parseFloat(document.querySelector("#mass-flow-input").value),
        qnorm: parseFloat(
          document.querySelector("#emmission-standard-input").value
        ),
        t: parseFloat(document.querySelector("#emission-time-input").value),
        Q: parseFloat(document.querySelector("#Q-input").value),
        Y: parseFloat(document.querySelector("#Y-input").value),
      };

      const damageType = document.querySelector("#damage-type-input").value;
      const damages = calculateDamages(damageType, damageParams);

      // Prepare update info
      const updatedInfo = {
        objectName: document.querySelector("#object-name-input").value,
        pollutantName,
        reportYear: document.querySelector("#report-year-input").value,
        emissionVolume,
        massFlow: damageParams.qmi,
        concentration,
        hq: hq.toFixed(4),
        cr: cr.toFixed(5),
        taxType: emissionType,
        taxRate,
        taxSum: taxSum.toFixed(2),
        damages: damages.toFixed(4),
      };

      // Send update request to server
      return fetch("http://localhost:5000/update", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          info: updatedInfo,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            updateRowInTable(id, updatedInfo);
            clearFormInputs("enterprise-form");
            document.querySelector("#update-row-input").hidden = true;
          } else {
            alert("Failed to update: " + data.message);
          }
        });
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
    row.children[12].textContent = info.damages;
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
      message: "Фактичні витрати зворотних вод не можуть бути від'ємними.",
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
      "Викиди в атмосферне повітря": {
        hide: [
          "water-waste-fields",
          "waste-disposal-fields",
          "radioactive-fields",
          "radioact-waste-stor-fields",
        ],
        show: ["tax-rate-input"],
      },

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

    const fields = taxFieldMappings[emissionType] || { show: [], hide: [] };

    fields.show.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = "block";
      }
    });

    fields.hide.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = "none";
      }
    });

    //Для ставки податку
    const taxRateInput = document.getElementById("tax-rate-input");
    taxRateInput.style.display = fields.hideTax ? "none" : "block";
  });

// Показувати/ховати додаткові поля в залежності від вибору типу відшкодування збитків
document
  .querySelector("#damage-type-input")
  .addEventListener("change", function () {
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
    fields.show.forEach(
      (id) => (document.getElementById(id).style.display = "block")
    );

    // Сховати решту полів
    fields.hide.forEach(
      (id) => (document.getElementById(id).style.display = "none")
    );
  });

// Показувати/ховати додаткові поля в залежності від вибору типу шкоди
document
  .querySelector("#emergency-damage-type-input")
  .addEventListener("change", function () {
    const damageType = this.value;

    const emergDamageFieldMappings = {
      "Розмір шкоди для атмосферного повітря": {
        show: ["emergency-air-damage-fields"],
        hide: ["emergency-water-damage-fields", "emergency-soil-damage-fields"],
      },
      "Розмір шкоди для водних ресурсів": {
        show: ["emergency-water-damage-fields"],
        hide: ["emergency-air-damage-fields", "emergency-soil-damage-fields"],
      },
      "Розмір шкоди для земельних ресурсів": {
        show: ["emergency-soil-damage-fields"],
        hide: ["emergency-air-damage-fields", "emergency-water-damage-fields"],
      },
    };

    const fields = emergDamageFieldMappings[damageType] || {
      show: [],
      hide: [
        "emergency-air-damage-fields",
        "emergency-water-damage-fields",
        "emergency-soil-damage-fields",
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
  });

// Tax calculation functions
function calculateTax(
  emissionType,
  emissionVolume,
  taxRate,
  additionalParams = {}
) {
  let taxSum = 0;

  switch (emissionType) {
    case "Викиди в атмосферне повітря":
      taxSum = emissionVolume * taxRate;
      break;

    case "Викиди у водні об'єкти":
      taxSum = emissionVolume * taxRate * additionalParams.correctionCoeff;
      break;

    case "За розміщення відходів":
      taxSum = emissionVolume * taxRate * additionalParams.wasteDisposalCoeff;
      break;

    case "Утворення радіоактивних відходів":
      const H = 0.0133;
      taxSum =
        additionalParams.On * H +
        additionalParams.wasteCoeff *
          additionalParams.storageCost *
          emissionVolume +
        (1 / 32) *
          (additionalParams.wasteCoeff *
            additionalParams.storageCostBef2009 *
            additionalParams.accumulatedWasteVolume);
      break;

    case "Зберігання радіоактивних відходів":
      taxSum =
        emissionVolume * taxRate * additionalParams.radioactWasteStorCoeff;
      break;
  }

  return taxSum;
}

// Health risk calculation functions
function calculateHealthRisk(concentration, SF, RFC) {
  const CR = 20; // швидкість надходження повітря до організму
  const EF = 350; // частота впливу, днів на рік
  const ED = 70; // тривалість впливу, років
  const BW = 70; // середня маса тіла людини
  const AT = 70; // період усереднення експозиції, років

  const ladd = (concentration * CR * EF * ED) / (BW * AT * 365);
  const hq = RFC > 0 ? ladd / RFC : 0;
  const cr = SF > 0 ? ladd * SF : 0;

  return { hq, cr, ladd };
}

// Damage calculation helper functions
function calculateAi(mpc) {
  // безрозмірний показник відносної небезпечності i-тої забруднюючої речовини
  if (mpc > 1) {
    return 10 / mpc;
  } else if (mpc <= 0) {
    return 500;
  } else {
    return 1 / mpc;
  }
}

function GetMi(qmi, qnorm, t) {
  return 3.6 * Math.pow(10, -3) * (qmi - qnorm) * t;
}

function GetMiWater(concentration, mpc, t, Q) {
  // MiW = (Cif - Cid) * Q * t * Math.pow(10, -6) // в тоннах
  //Сіф = concentration - середня фактична концентрація, г/м^3
  //Сід = mpc - дозволена для скиду концентрація(гдк),
  // Q - фактичні витрати зворотних вод, м^3/год
  // t - тривалість скидання забруднюючих речовин з порушенням норм ГДК, год

  // Перевірка: якщо concentration < mpc, то їх різниця = 1
  const difference = concentration < mpc ? 1 : concentration - mpc;

  return difference * Q * t * Math.pow(10, -6);
}

// Функція для обчислення збитків за викиди в атмосферу
function calculateAirDamage(params) {
  const minWage = 1.1 * 6700;
  const Ai = calculateAi(params.mpc);
  const Knas = 1.8;
  const Kf = 1.65;
  const Kt = Knas * Kf;
  const Kzi =
    params.concentration > 0 && params.mpc > 0 && params.mpc != 0
      ? params.concentration / params.mpc
      : 1;
  const Mi = GetMi(params.qmi, params.qnorm, params.t);

  const damages = Mi * minWage * Ai * Kt * Kzi;

  alert(
    `Mi: ${Mi.toFixed(4)}, Knas: ${Knas.toFixed(2)}, Kf: ${Kf.toFixed(
      2
    )}, Kt: ${Kt.toFixed(2)},
     Kzi: ${Kzi.toFixed(3)}, Ai: ${Ai.toFixed(3)}, minWage: ${minWage.toFixed(
      2
    )}`
  );

  return damages;
}

// Функція для обчислення збитків за викиди в водні об'єкти
function calculateWaterDamage(params) {
  const Kat = 1.5;
  const Kr = 1.21;
  const Kz = 1.5;
  const Ai = calculateAi(params.mpc);
  const MiW = GetMiWater(params.concentration, params.mpc, params.t, params.Q);
  const Yi = params.Y * Ai;

  const damages = Kat * Kr * Kz * MiW * Yi;

  alert(
    `З = Кат * Кр * Кз * Мі * Yi, 
     MiW: ${MiW.toFixed(4)}, Kat: ${Kat.toFixed(2)}, Kr: ${Kr.toFixed(
      2
    )}, Kz: ${Kz.toFixed(2)},
     Yi: ${Yi.toFixed(3)}, Ai: ${Ai.toFixed(3)}`
  );

  return damages;
}

// Основна функція для обчислення збитків
function calculateDamages(damageType, params) {
  let damages = 0;

  if (damageType === "Відшкодування збитків за викиди в атмосферне повітря") {
    damages = calculateAirDamage(params);
  } else if (damageType === "Відшкодування збитків за викиди у водні об'єкти") {
    damages = calculateWaterDamage(params);
  }

  return damages;
}

const addBtn = document.querySelector("#add-info-btn");

addBtn.onclick = function () {
  if (!validateInputs()) {
    return;
  }

  // Get tax calculation inputs
  const emissionType = document.querySelector("#tax-type-input").value;
  const emissionVolume = parseFloat(
    document.querySelector("#emission-volume-input").value
  );
  const taxRate = parseFloat(document.querySelector("#tax-rate-input").value);

  // Additional parameters for specific tax types
  const additionalParams = {
    correctionCoeff: parseFloat(
      document.querySelector("#correc-coeff-input")?.value || 0
    ),
    wasteDisposalCoeff: parseFloat(
      document.querySelector("#waste-disposal-coeff")?.value || 0
    ),
    On: parseFloat(document.querySelector("#energy-input")?.value || 0),
    wasteCoeff: parseFloat(
      document.querySelector("#waste-coeff-input")?.value || 0
    ),
    storageCost: parseFloat(
      document.querySelector("#storage-cost-input")?.value || 0
    ),
    storageCostBef2009: parseFloat(
      document.querySelector("#storage-cost-before-2009")?.value || 0
    ),
    accumulatedWasteVolume: parseFloat(
      document.querySelector("#accumulated-waste-volume")?.value || 0
    ),
    radioactWasteStorCoeff: parseFloat(
      document.querySelector("#radioact-waste-stor-coeff")?.value || 0
    ),
  };

  // Calculate tax
  const taxSum = calculateTax(
    emissionType,
    emissionVolume,
    taxRate,
    additionalParams
  );
  document.querySelector("#tax-sum-input").value = taxSum.toFixed(2);

  // Get health risk inputs
  const concentration = parseFloat(
    document.querySelector("#compound-concentr-input").value
  );
  const pollutantName = document.querySelector("#pollutant-name-input").value;

  if (!concentration || !pollutantName) {
    alert("Будь ласка, введіть концентрацію та виберіть речовину.");
    return;
  }

  // Fetch pollutant data and calculate risks
  fetch(`http://localhost:5000/getPollutantFactors?name=${pollutantName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || typeof data !== "object") {
        throw new Error("Невірний формат даних від сервера");
      }

      const SF = parseFloat(data.SF) || 0;
      const RFC = parseFloat(data.RFC) || 0;
      const mpc = parseFloat(data.MPC) || 0;

      if (RFC === 0 && SF === 0) {
        alert(
          "Увага: Для цієї речовини відсутні значення SF та RFC. Ризики будуть розраховані як 0."
        );
      }

      // Calculate health risks
      const { hq, cr, ladd } = calculateHealthRisk(concentration, SF, RFC);

      // Update form fields
      document.querySelector("#hq-input").value = hq.toFixed(4);
      document.querySelector("#cr-input").value = cr.toFixed(5);

      alert(
        `Ladd: ${ladd.toFixed(6)}, HQ: ${hq.toFixed(2)}, CR: ${cr.toFixed(2)}`
      );

      // Calculate damages
      const damageParams = {
        concentration,
        mpc, //ГДК
        qmi: parseFloat(document.querySelector("#mass-flow-input").value), // середнє арифметичне значення результатів вимірювань масової витрати
        qnorm: parseFloat(
          document.querySelector("#emmission-standard-input").value
        ), // затверджений норматив викиду
        t: parseFloat(document.querySelector("#emission-time-input").value), //тривалість скидання забруднюючих речовин з порушенням норм ГДК
        Q: parseFloat(document.querySelector("#Q-input").value),
        Y: parseFloat(document.querySelector("#Y-input").value), // проіндексований питомий економ. збиток від забруднення вод.ресурсів у поточному році.
      };

      const damageType = document.querySelector("#damage-type-input").value;
      const damages = calculateDamages(damageType, damageParams);
      document.querySelector("#damages-input").value = damages.toFixed(4);

      // Prepare data for report
      const info = {
        objectName: document.querySelector("#object-name-input").value,
        pollutantName,
        reportYear: document.querySelector("#report-year-input").value,
        emissionVolume,
        massFlow: damageParams.qmi,
        concentration,
        hq: hq.toFixed(4),
        cr: cr.toFixed(5),
        taxType: emissionType,
        taxRate,
        taxSum: taxSum.toFixed(2),
        damages: damages.toFixed(2),
      };

      // Send data to server
      return fetch("http://localhost:5000/insert", {
        headers: {
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ info }),
      });
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
    })
    .then(() => {
      clearFormInputs("report-form");
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
  tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Видалити</button></td>`; // кнопки видалення та редагування
  tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Редагувати</button></td>`;
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
    tableHtml += `<td><button class="delete-row-btn" data-id=${idReport}>Видалити</button></td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${idReport}>Редагувати</button></td>`;
    tableHtml += "</tr>";
  });

  table.innerHTML = tableHtml;
}

function loadEmergencyDamageTable() {
  fetch("http://localhost:5000/getAllEmergencyDamages")
    .then((response) => response.json())
    .then((responseData) => {
      const data = responseData.data; // Access the 'data' property
      const table = document.querySelector("#emergencyDamageTable tbody");

      if (data.length === 0) {
        table.innerHTML =
          "<tr><td class='no-data' colspan='7'>No Data</td></tr>";
        return;
      }

      let tableHtml = "";
      data.forEach(
        ({
          idDamage,
          EnterpriseName,
          PollutantName,
          Year,
          TypeOfDamage,
          DamageAmount,
        }) => {
          tableHtml += "<tr>";
          tableHtml += `<td>${idDamage}</td>`;
          tableHtml += `<td>${EnterpriseName}</td>`;
          tableHtml += `<td>${PollutantName}</td>`;
          tableHtml += `<td>${Year}</td>`;
          tableHtml += `<td>${TypeOfDamage}</td>`;
          tableHtml += `<td>${DamageAmount}</td>`;
          tableHtml += `<td><button class="delete-btn" onclick="deleteEmergencyDamage(${idDamage})">Видалити</button></td>`;
          // tableHtml += `<td><button class="edit-row-btn" data-id=${idDamage}>Edit</button></td>`;
          tableHtml += "</tr>";
        }
      );
      table.innerHTML = tableHtml;
    })
    .catch((error) => console.error("Error loading emergency damages:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  loadEmergencyDamageTable();
});

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
          <td>${pollutant.SpecificEmissions}</td>
          <td>${pollutant.Tax}</td>
          <td>${pollutant.HazardCoefficient}</td>
          <td>${pollutant.Kn}</td>
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

// Функція обчислення питомого показника викиду
function calculateMi(specificEmissions, burntPollutantMass) {
  // Мі = qi * Мсі
  // specificEmissions = qi - питомий показник викиду забруднюючої речовини, т/т
  // burntPollutantMass = Мсі - маса згорілої речовини, т
  return specificEmissions * burntPollutantMass;
}

// Функція обчислення суми збитків за забруднення повітря при надзвичайній ситуації
function airEmergDamageAmount(
  Mi,
  tax,
  hazardCoefficient,
  impactCoeff,
  eventScaleCoeff
) {
  // Рш = Мі * Сп * Кнеб * Кв * Кмп * Кпп
  // tax  = Сп, грн/т
  // hazardCoefficient = Кнеб
  // impactCoeff = Кв - коефіцієнт впливу, год
  // eventScaleCoeff = Кмп - коефіцієнт масштабу подій, тон або Га
  const Kpp = 10; // коефіцієнт, що залежить від характеру подій
  return Mi * tax * hazardCoefficient * impactCoeff * eventScaleCoeff * Kpp;
}

// Функція обчислення вартості рекультивації (Вр)
function calculateVr(S, pollutedZoneRatio, complexityCoeff) {
  // Вр = К(с) * К(к) * К(з)
  const ranges = [5, 10, 20, 50, 100]; // Граничні значення для діапазонів
  const values = [25000, 30000, 35000, 40000, 45000, 50000]; // Відповідні значення P1

  let P1 = values[values.length - 1]; // П1 - базова вартість, залежить від S

  for (let i = 0; i < ranges.length; i++) {
    if (S <= ranges[i]) {
      P1 = values[i];
      break;
    }
  }

  let P2 = 4000; // П2 - вартість за площею
  let soilWorkCoefficient = (P1 + P2) * S; // К(з) - коефіцієнт робіт із землею
  return complexityCoeff * pollutedZoneRatio * soilWorkCoefficient;
}

// Функція обчислення розміру шкоди від забруднення ґрунтів, грн
function soilPollutionDamage(normativeLandValue, S, Kn, Vr) {
  // Рш = A * ГОЗ * ПД * КН * Ко + Вр
  let A = 1.5; // питомі витрати на ліквідацію наслідків
  let Ko = 4; // Ко - коефіцієнт для врахування природоохороної цінності земельної ділянки
  return A * normativeLandValue * S * Kn * Ko * Vr;
}

// Функція для обчислення збитків для водних ресурсів
function waterEmergDamageAmount(waterDamage) {
  return 10 * waterDamage;
}

document
  .querySelector("#pollutant-input")
  .addEventListener("change", function () {
    const pollutantName = document.querySelector("#pollutant-input").value;

    fetch(`http://localhost:5000/getPollutantFactors?name=${pollutantName}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data || typeof data !== "object") {
          throw new Error("Невірний формат даних від сервера");
        }

        // Отримання значень з об'єкта 'data' або встановлення 0, якщо значення відсутнє
        const tax = parseFloat(data.Tax) || 0;
        const hazardCoefficient = parseFloat(data.HazardCoefficient) || 0;
        const specificEmissions = parseFloat(data.SpecificEmissions) || 0;
        const Kn = parseFloat(data.Kn) || 0;
        const mpc = parseFloat(data.MPC) || 0;

        pollutantData = {
          tax: tax,
          hazardCoefficient: hazardCoefficient,
          specificEmissions: specificEmissions,
          Kn: Kn,
          mpc: mpc,
        };
      })
      .catch((error) =>
        console.error("Помилка завантаження даних речовини:", error)
      );
  });

// Обробка форми для додавання нового запису
document
  .querySelector("#emergency-damage-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    if (!pollutantData) {
      alert("Будь ласка, виберіть речовину для розрахунків.");
      return;
    }

    const damageType = document.querySelector(
      "#emergency-damage-type-input"
    ).value;
    let damageAmount = 0;

    if (damageType === "Розмір шкоди для атмосферного повітря") {
      const burntPollutantMass =
        parseFloat(
          document.querySelector("#burnt-pollutant-mass-input").value
        ) || 0;
      const impactCoeff = parseFloat(
        document.querySelector("#impact-coeff-input").value
      );
      const eventScaleCoeff = parseFloat(
        document.querySelector("#event-scale-coeff-input").value
      );

      const Mi = calculateMi(
        pollutantData.specificEmissions,
        burntPollutantMass
      );
      damageAmount = airEmergDamageAmount(
        Mi,
        pollutantData.tax,
        pollutantData.hazardCoefficient,
        impactCoeff,
        eventScaleCoeff
      );
    } else if (damageType === "Розмір шкоди для водних ресурсів") {
      // Отримуємо параметри для розрахунку
      const params = {
        concentration: parseFloat(
          document.querySelector("#emergency-compound-concentr-input").value
        ),
        mpc: pollutantData.mpc,
        t: parseFloat(
          document.querySelector("#emergency-emission-time-input").value
        ),
        Q: parseFloat(document.querySelector("#emergency-Q-input").value),
        Y: parseFloat(document.querySelector("#emergency-Y-input").value),
      };

      // Використовуємо ту саму функцію calculateWaterDamage, що й для звичайних викидів
      damageAmount = 10 * calculateWaterDamage(params);

      alert(
        `Параметри розрахунку:\n
       Концентрація: ${params.concentration}\n
       ГДК: ${params.mpc}\n
       Час: ${params.t}\n
       Q: ${params.Q}\n
       Y: ${params.Y}\n
       Розмір збитків: ${damageAmount.toFixed(2)}`
      );
    } else if (damageType === "Розмір шкоди для земельних ресурсів") {
      const normativeLandValue =
        parseFloat(
          document.querySelector("#normative-land-value-input").value
        ) || 0;
      const S = parseFloat(document.querySelector("#S-input").value) || 0;
      const pollutedZoneRatio =
        parseFloat(
          document.querySelector("#polluted-zone-ratio-input").value
        ) || 0;
      const complexityCoeff =
        parseFloat(document.querySelector("#complexity-coeff-input").value) ||
        0;

      const Vr = calculateVr(S, pollutedZoneRatio, complexityCoeff);
      damageAmount = soilPollutionDamage(
        normativeLandValue,
        S,
        pollutantData.Kn,
        Vr
      );

      alert(`Вартість рекультивації (Vr): ${Vr}\n`);
    }

    const newDamage = {
      objectName: document.querySelector("#enterprise-name-input").value,
      pollutantName: document.querySelector("#pollutant-input").value,
      damageYear: document.querySelector("#damage-year-input").value,
      damageType: damageType,
      damageAmount: damageAmount.toFixed(2),
    };

    fetch("http://localhost:5000/addEmergencyDamage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDamage),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Запис додано!");
          clearFormInputs("emergency-damage-form");
          loadEmergencyDamageTable();
        } else {
          alert("Не вдалося додати запис.");
        }
      })
      .catch((error) =>
        console.error("Помилка при додаванні аварійного збитку:", error)
      );
  });

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
          clearFormInputs("enterprise-form");
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
      specificEmissions: document.querySelector("#new-specific-emissions")
        .value,
      tax: document.querySelector("#new-tax").value,
      hazardCoefficient: document.querySelector("#new-hazard-coefficient")
        .value,
      Kn: document.querySelector("#new-Kn").value,
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

function deleteEmergencyDamage(id) {
  fetch(`http://localhost:5000/deleteEmergencyDamage/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Поле видалено!");
        loadEmergencyDamageTable(); // Перезавантажуємо таблицю підприємств
      } else {
        alert("Не вдалося видалити поле.");
      }
    })
    .catch((error) => console.error("Error deleting row:", error));
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
