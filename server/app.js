const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const DbService = require("./dbService");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------- Маршрути -------- //

// Пошук за назвою підприємства або речовини
app.get("/search", (req, res) => {
  const { query } = req.query;
  const db = DbService.getDbServiceInstance();

  db.searchByQuery(query)
    .then((data) => res.json({ data }))
    .catch((err) => {
      console.error("Error in /search route:", err);
      res.status(500).json({ message: "Error searching data" });
    });
});

// Сортування за полем
app.get("/sort", (req, res) => {
  const { field } = req.query;
  const db = DbService.getDbServiceInstance();

  db.sortByField(field)
    .then((data) => res.json({ data }))
    .catch((err) => {
      console.error("Error in /sort route:", err);
      res.status(500).json({ message: "Error sorting data" });
    });
});

// Вставка нового запису
app.post("/insert", (req, res) => {
  const info = req.body.info;
  const db = DbService.getDbServiceInstance();

  db.insertNewInfo(info)
    .then((data) => res.json({ data }))
    .catch((err) => {
      console.error("Error in /insert route:", err);
      res.status(500).json({ message: "Error inserting data" });
    });
});

app.post("/addEnterprise", (req, res) => {
  const { name, address, activityType } = req.body;
  const db = DbService.getDbServiceInstance();

  db.addEnterprise({ name, address, activityType })
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error("Error adding enterprise:", err);
      res.status(500).json({ success: false, message: "Failed to add enterprise" });
    });
});

app.post("/addPollutant", (req, res) => {
  const { name, hazardClass, mpc, rfc, sf, specificEmissions, tax, hazardCoefficient, Kn } = req.body;
  const db = DbService.getDbServiceInstance();

  db.addPollutant({ name, hazardClass, mpc, rfc, sf, specificEmissions, tax, hazardCoefficient, Kn })
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error("Error adding pollutant:", err);
      res.status(500).json({ success: false, message: "Failed to add pollutant" });
    });
});

app.post("/addEmergencyDamage", (req, res) => {
  const { objectName, pollutantName, damageYear, damageType, damageAmount } = req.body;
  const db = DbService.getDbServiceInstance();

  // Викликаємо метод для додавання нового запису
  db.addEmergencyDamage({ objectName, pollutantName, damageYear, damageType, damageAmount })
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error("Error adding emergency damage:", err);
      res.status(500).json({ success: false, message: "Failed to add emergency damage" });
    });
});

// Отримання всіх даних
app.get("/getAll", (req, res) => {
  const db = DbService.getDbServiceInstance();

  db.getAllData()
    .then((data) => res.json({ data }))
    .catch((err) => {
      console.error("Error in /getAll route:", err);
      res.status(500).json({ message: "Error fetching data" });
    });
});

// Отримання назви та id  підприємств
app.get("/getEnterprises", (req, res) => {
  const db = DbService.getDbServiceInstance();

  db.getEnterprises()
    .then((data) => res.json(data))
    .catch((err) => {
      console.error("Error in /getEnterprises route:", err);
      res.status(500).json({ message: "Error fetching enterprises" });
    });
});

// Отримання назви та id забруднювачів
app.get("/getPollutants", (req, res) => {
  const db = DbService.getDbServiceInstance();

  db.getPollutants()
    .then((data) => res.json(data))
    .catch((err) => {
      console.error("Error in /getPollutants route:", err);
      res.status(500).json({ message: "Error fetching pollutants" });
    });
});

// отримання всіх забруднюючих речовин
app.get("/getAllPollutants", (request, response) => {
  const db = DbService.getDbServiceInstance();
  const result = db.getAllPollutants();
  result
    .then((data) => response.json(data))
    .catch((err) => {
      console.log(err);
      response.status(500).json({ error: err.message });
    });
});

//отримання всіх підприємств
app.get("/getAllEnterprises", (request, response) => {
  const db = DbService.getDbServiceInstance();
  const result = db.getAllEnterprises();
  result
    .then((data) => response.json(data))
    .catch((err) => {
      console.log(err);
      response.status(500).json({ error: err.message });
    });
});

// app.js

app.get("/getAllEmergencyDamages", (req, res) => {
  const db = DbService.getDbServiceInstance();

  db.getAllEmergencyDamages()
    .then((data) => res.json({ data }))
    
    .catch((err) => {
      console.error("Error in /getAllEmergencyDamages route:", err);
      res.status(500).json({ message: "Error fetching emergency damages data" });
    });
});


// Оновлення запису
app.patch("/update", (req, res) => {
  const { id, info } = req.body;
  const db = DbService.getDbServiceInstance();

  db.updateRowById(id, info)
    .then((success) => {
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Row not found or no changes made" });
      }
    })
    .catch((err) => {
      console.error("Error in /update route:", err);
      res.status(500).json({ message: "Error updating row" });
    });
});

app.get("/getPollutantFactors", (req, res) => {
  const { name } = req.query;
  const db = DbService.getDbServiceInstance();

  db.getPollutantFactors(name)
    .then((data) => {
      if (data) {
        res.json(data); // Повертаємо SF і RFC
      } else {
        res.status(404).json({ message: "Речовину не знайдено." });
      }
    })
    .catch((err) => {
      console.error("Помилка при отриманні даних про речовину:", err);
      res.status(500).json({ message: "Помилка сервера при отриманні речовини." });
    });
});

// Видалення запису
app.delete("/delete/:id", (request, response) => {
  const { id } = request.params;
  const db = DbService.getDbServiceInstance();

  db.deleteRowById(id)
    .then((data) => {
      if (data) {
        // Скидання AUTO_INCREMENT, якщо таблиця порожня
        db.resetAutoIncrementIfEmpty();
        response.json({ success: true });
      } else {
        response.status(404).json({ success: false, message: "Row not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      response
        .status(500)
        .json({ success: false, message: "Error deleting row" });
    });
});

app.delete("/deleteEmergencyDamage/:id", (req, res) => {
  const { id } = req.params;
  const db = DbService.getDbServiceInstance();

  db.deleteEmergencyDamageById(id)
    .then((result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "EmergencyDamage not found" });
      }
    })
    .catch((err) => {
      console.error("Error in /deleteEmergencyDamage route:", err);
      res.status(500).json({ success: false, message: "Error deleting EmergencyDamage" });
    });
});

app.delete("/deleteEnterprise/:id", (req, res) => {
  const { id } = req.params;
  const db = DbService.getDbServiceInstance();

  db.deleteEnterpriseById(id)
    .then((result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Enterprise not found" });
      }
    })
    .catch((err) => {
      console.error("Error in /deleteEnterprise route:", err);
      res.status(500).json({ success: false, message: "Error deleting enterprise" });
    });
});

app.delete("/deletePollutant/:id", (req, res) => {
  const { id } = req.params;
  const db = DbService.getDbServiceInstance();

  db.deletePollutantById(id)
    .then((result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Pollutant not found" });
      }
    })
    .catch((err) => {
      console.error("Error in /deletePollutant route:", err);
      res.status(500).json({ success: false, message: "Error deleting pollutant" });
    });
});


// -------- Запуск сервера -------- //
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
