import { query } from '../config/database.js';

export const carController = {
  // Get all cars
   // Get all cars with filters
  async getAllCars(req, res) {
    try {
      const {
        category,
        location,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 10
      } = req.query;

      let sql = `
        SELECT c.*, 
          COALESCE((SELECT AVG(rating) FROM reviews WHERE car_id = c.id), 0) as average_rating
        FROM cars c
        WHERE c.status = 'available'
      `;
      
      const params = [];
      let paramCount = 0;

      // Category filter
      if (category) {
        paramCount++;
        sql += ` AND c.category = $${paramCount}`;
        params.push(category);
      }

      // Location filter
      if (location) {
        paramCount++;
        sql += ` AND c.location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
      }

      // Price range
      if (minPrice) {
        paramCount++;
        sql += ` AND c.price_per_day >= $${paramCount}`;
        params.push(minPrice);
      }

      if (maxPrice) {
        paramCount++;
        sql += ` AND c.price_per_day <= $${paramCount}`;
        params.push(maxPrice);
      }

      // Search by make/model
      if (search) {
        paramCount++;
        sql += ` AND (c.make ILIKE $${paramCount} OR c.model ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      // Pagination
      const offset = (page - 1) * limit;
      sql += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);
      
      // Get total count for pagination
      let countSql = `SELECT COUNT(*) FROM cars WHERE status = 'available'`;
      const countParams = [];
      
      if (category) {
        countParams.push(category);
        countSql += ` AND category = $${countParams.length}`;
      }
      if (location) {
        countParams.push(`%${location}%`);
        countSql += ` AND location ILIKE $${countParams.length}`;
      }
      if (minPrice) {
        countParams.push(minPrice);
        countSql += ` AND price_per_day >= $${countParams.length}`;
      }
      if (maxPrice) {
        countParams.push(maxPrice);
        countSql += ` AND price_per_day <= $${countParams.length}`;
      }
      if (search) {
        countParams.push(`%${search}%`);
        countSql += ` AND (make ILIKE $${countParams.length} OR model ILIKE $${countParams.length})`;
      }

      const countResult = await query(countSql, countParams);

      res.json({
        status: 'success',
        count: result.rowCount,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        currentPage: parseInt(page),
        cars: result.rows
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Get single car
  async getCarById(req, res) {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM cars WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Car not found' });
      }
      
      res.json({
        status: 'success',
        car: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Create car
   // Create car
  async createCar(req, res) {
    try {
      const {
        make, model, year, licensePlate, category,
        color, seats, transmission, fuelType,
        pricePerDay, location, description
      } = req.body;

      const images = req.files ? req.files.map(file => `/uploads/cars/${file.filename}`) : [];

      const result = await query(
        `INSERT INTO cars (make, model, year, license_plate, category, color, seats,
         transmission, fuel_type, price_per_day, location, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          make, model, year, licensePlate, category, color, seats,
          transmission, fuelType, pricePerDay, location, description,
          JSON.stringify(images)
        ]
      );

      res.status(201).json({
        status: 'success',
        car: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Update car - ADD THIS FUNCTION
  async updateCar(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const fields = [];
      const values = [];
      let paramCount = 0;

      // Map client-side/camelCase keys to DB column names
      const fieldMap = {
        licensePlate: 'license_plate',
        fuelType: 'fuel_type',
        fueltype: 'fuel_type',
        pricePerDay: 'price_per_day',
        priceperday: 'price_per_day'
      };

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          const columnName = fieldMap[key] || key;
          paramCount++;
          fields.push(`${columnName} = $${paramCount}`);
          values.push(updates[key]);
        }
      });

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/cars/${file.filename}`);
        paramCount++;
        fields.push(`images = images || $${paramCount}::jsonb`);
        values.push(JSON.stringify(newImages));
      }

      if (fields.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No fields to update' });
      }

      values.push(id);
      const sql = `UPDATE cars SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount + 1} RETURNING *`;
      
      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Car not found' });
      }

      res.json({
        status: 'success',
        car: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Delete car - ADD THIS FUNCTION
  async deleteCar(req, res) {
    try {
      const { id } = req.params;
      
      const result = await query(
        'UPDATE cars SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['retired', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Car not found' });
      }

      res.json({ 
        status: 'success',
        message: 'Car removed successfully' 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};