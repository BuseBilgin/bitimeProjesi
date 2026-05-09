const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/database');

const fallbackMedicationsPath = path.join(__dirname, '../../data/fallback-medications.json');

async function readFallbackMedications() {
  try {
    const content = await fs.readFile(fallbackMedicationsPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeFallbackMedications(medications) {
  await fs.mkdir(path.dirname(fallbackMedicationsPath), { recursive: true });
  await fs.writeFile(fallbackMedicationsPath, JSON.stringify(medications, null, 2));
}

function shouldUseFallback(error) {
  return (
    error?.code === 'ER_ACCESS_DENIED_ERROR' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'PROTOCOL_CONNECTION_LOST'
  );
}

class Medication {
  static async create(medicationData) {
    const { user_id, name, active_ingredient, dosage, frequency, schedule_time, start_date, end_date, note } = medicationData;

    try {
      const [result] = await pool.execute(
        'INSERT INTO pill_reminder_medications (user_id, name, active_ingredient, dosage, frequency, schedule_time, start_date, end_date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, name, active_ingredient, dosage, frequency, schedule_time ?? null, start_date, end_date, note ?? null]
      );
      return result.insertId;
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const medications = await readFallbackMedications();
      const nextId = medications.length ? Math.max(...medications.map((medication) => Number(medication.id) || 0)) + 1 : 1;

      medications.push({
        id: nextId,
        user_id: Number(user_id),
        name,
        active_ingredient,
        dosage: dosage ?? null,
        frequency: frequency ?? null,
        schedule_time: schedule_time ?? null,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
        note: note ?? null,
      });

      await writeFallbackMedications(medications);
      return nextId;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM pill_reminder_medications WHERE user_id = ?', [userId]);
      return rows;
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const medications = await readFallbackMedications();
      return medications.filter((medication) => Number(medication.user_id) === Number(userId));
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM pill_reminder_medications WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const medications = await readFallbackMedications();
      return medications.find((medication) => Number(medication.id) === Number(id));
    }
  }

  static async update(id, medicationData) {
    const { name, active_ingredient, dosage, frequency, schedule_time, start_date, end_date, note } = medicationData;

    try {
      await pool.execute(
        'UPDATE pill_reminder_medications SET name = ?, active_ingredient = ?, dosage = ?, frequency = ?, schedule_time = ?, start_date = ?, end_date = ?, note = ? WHERE id = ?',
        [name, active_ingredient, dosage, frequency, schedule_time ?? null, start_date, end_date, note ?? null, id]
      );
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const medications = await readFallbackMedications();
      const medicationIndex = medications.findIndex((medication) => Number(medication.id) === Number(id));

      if (medicationIndex === -1) {
        return;
      }

      medications[medicationIndex] = {
        ...medications[medicationIndex],
        name,
        active_ingredient,
        dosage: dosage ?? null,
        frequency: frequency ?? null,
        schedule_time: schedule_time ?? null,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
        note: note ?? null,
      };

      await writeFallbackMedications(medications);
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM pill_reminder_medications WHERE id = ?', [id]);
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const medications = await readFallbackMedications();
      const nextMedications = medications.filter((medication) => Number(medication.id) !== Number(id));
      await writeFallbackMedications(nextMedications);
    }
  }
}

module.exports = Medication;