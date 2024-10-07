const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

let instance = null;

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
  charset: "utf8_general_ci",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    console.error("Error details:", err);
  }
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  // Отримання всіх даних
  async getAllData() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
          SELECT r.idReport, e.EnterpriseName, p.PollutantName, r.Year, r.EmissionType, 
                 r.EmissionVolume, r.MassFlow, r.TaxType, r.TaxRate, r.TaxSum
          FROM Report r
          JOIN Enterprise e ON r.Enterprise_idEnterprise = e.idEnterprise
          JOIN Pollutant p ON r.Pollutant_idPollutant = p.idPollutant
        `;
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  // Отримання ID підприємства за назвою
  async getEnterpriseId(enterpriseName) {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT idEnterprise FROM Enterprise WHERE EnterpriseName = ?";
      connection.query(query, [enterpriseName], (err, results) => {
        if (err) reject(err);
        if (results.length > 0) {
          resolve(results[0].idEnterprise);
        } else {
          reject(new Error("Enterprise not found"));
        }
      });
    });
  }

  // Отримання ID забруднювача за назвою
  async getPollutantId(pollutantName) {
    return new Promise((resolve, reject) => {
      const query = "SELECT idPollutant FROM Pollutant WHERE PollutantName = ?";
      connection.query(query, [pollutantName], (err, results) => {
        if (err) reject(err);
        if (results.length > 0) {
          resolve(results[0].idPollutant);
        } else {
          reject(new Error("Pollutant not found"));
        }
      });
    });
  }

  // Отримання id та назви підприємств
  async getEnterprises() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "SELECT idEnterprise, EnterpriseName FROM Enterprise";
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Отримання id та назви забруднювачів
  async getPollutants() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "SELECT idPollutant, PollutantName FROM Pollutant";
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // отримання даних про всі забруднюючі речовини
  async getAllPollutants() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "SELECT * FROM Pollutant";
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // отримання даних про всі підприємства
  async getAllEnterprises() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "SELECT * FROM Enterprise";
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Вставка нової інформації
  async insertNewInfo(info) {
    try {
      const enterpriseId = await this.getEnterpriseId(info.objectName);
      const pollutantId = await this.getPollutantId(info.pollutantName);

      const insertId = await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO Report 
          (Enterprise_idEnterprise, Pollutant_idPollutant, Year, EmissionType, EmissionVolume, MassFlow, TaxType, TaxRate, TaxSum)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        connection.query(
          query,
          [
            enterpriseId,
            pollutantId,
            info.reportYear,
            info.emissionType,
            info.emissionVolume,
            info.massFlow,
            info.taxType,
            info.taxRate,
            info.taxSum,
          ],
          (err, result) => {
            if (err) {
              console.error("Error in query:", err);
              return reject(new Error(err.message));
            }
            resolve(result.insertId);
          }
        );
      });

      return {
        id: insertId,
        ...info,
      };
    } catch (error) {
      console.error("Error in insertNewInfo:", error);
      throw error;
    }
  }

  async addEnterprise(enterprise) {
    const { name, address, activityType } = enterprise;
    const query = `
      INSERT INTO Enterprise (EnterpriseName, Address, ActivityType)
      VALUES (?, ?, ?)
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(query, [name, address, activityType], (err, result) => {
        if (err) {
          console.error("Error in addEnterprise:", err);
          reject(err);
        }
        resolve(result.insertId);
      });
    });
  }

  async addPollutant(pollutant) {
    const { name, hazardClass, mpc } = pollutant;
    const query = `
      INSERT INTO Pollutant (PollutantName, HazardClass, MPC)
      VALUES (?, ?, ?)
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(query, [name, hazardClass, mpc], (err, result) => {
        if (err) {
          console.error("Error in addPollutant:", err);
          reject(err);
        }
        resolve(result.insertId);
      });
    });
  }
  
  
  // Видалення запису за ID
  async deleteRowById(id) {
    try {
      id = parseInt(id, 10);
      const response = await new Promise((resolve, reject) => {
        const query = "DELETE FROM report WHERE idReport = ?";
        connection.query(query, [id], (err, result) => {
          if (err) {
            console.error("Error in DELETE query:", err);
            return reject(new Error(err.message));
          }
          resolve(result.affectedRows);
        });
      });
      return response === 1;
    } catch (error) {
      console.error("Error in deleteRowById:", error);
      return false;
    }
  }

  async deleteEnterpriseById(id) {
    const query = "DELETE FROM Enterprise WHERE idEnterprise = ?";
    return new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) {
          console.error("Error in deleteEnterpriseById:", err);
          reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
  
  async deletePollutantById(id) {
    const query = "DELETE FROM Pollutant WHERE idPollutant = ?";
    return new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) {
          console.error("Error in deletePollutantById:", err);
          reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
  
  // Скидання AUTO_INCREMENT, якщо таблиця порожня
  async resetAutoIncrementIfEmpty() {
    try {
      const rowCount = await new Promise((resolve, reject) => {
        const query = "SELECT COUNT(*) AS count FROM Report;";

        connection.query(query, (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result[0].count);
        });
      });

      if (rowCount === 0) {
        await new Promise((resolve, reject) => {
          const query = "ALTER TABLE Report AUTO_INCREMENT = 1;";
          connection.query(query, (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          });
        });
      }
    } catch (error) {
      console.error("Error in resetAutoIncrementIfEmpty:", error);
      throw error;
    }
  }

  // Оновлення запису за ID
  async updateRowById(id, info) {
    try {
      const enterpriseId = await this.getEnterpriseId(info.objectName);
      const pollutantId = await this.getPollutantId(info.pollutantName);

      const response = await new Promise((resolve, reject) => {
        const query = `
          UPDATE Report 
          SET Enterprise_idEnterprise = ?, Pollutant_idPollutant = ?, Year = ?, EmissionType = ?, 
              EmissionVolume = ?, MassFlow = ?, TaxType = ?, TaxRate = ?, TaxSum = ?
          WHERE idReport = ?;
        `;
        connection.query(
          query,
          [
            enterpriseId,
            pollutantId,
            info.reportYear,
            info.emissionType,
            info.emissionVolume,
            info.massFlow,
            info.taxType,
            info.taxRate,
            info.taxSum,
            id,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating row:", err);
              return reject(err);
            }
            resolve(result.affectedRows);
          }
        );
      });

      return response === 1;
    } catch (error) {
      console.error("Error in updateRowById:", error);
      return false;
    }
  }

  // Пошук за назвою підприємства або речовини
  async searchByQuery(query) {
    try {
      const response = await new Promise((resolve, reject) => {
        const sqlQuery = `
          SELECT r.*, e.EnterpriseName, p.PollutantName
          FROM Report r
          JOIN Enterprise e ON r.Enterprise_idEnterprise = e.idEnterprise
          JOIN Pollutant p ON r.Pollutant_idPollutant = p.idPollutant
          WHERE e.EnterpriseName LIKE ? OR p.PollutantName LIKE ?;
        `;
        const searchPattern = `%${query}%`;

        connection.query(
          sqlQuery,
          [searchPattern, searchPattern],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.error("Error in searchByQuery:", error);
      throw error;
    }
  }

  // Сортування за полем
  async sortByField(field) {
    try {
      const response = await new Promise((resolve, reject) => {
        const validFields = ["Year", "EmissionVolume", "TaxSum"];
        if (!validFields.includes(field)) {
          return reject(new Error("Invalid sort field"));
        }

        const query = `
          SELECT r.*, e.EnterpriseName, p.PollutantName 
          FROM Report r
          JOIN Enterprise e ON r.Enterprise_idEnterprise = e.idEnterprise
          JOIN Pollutant p ON r.Pollutant_idPollutant = p.idPollutant
          ORDER BY CAST(${field} AS DECIMAL) ASC;
        `;

        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error("Error in sortByField:", error);
      throw error;
    }
  }
}

module.exports = DbService;
