const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

/* DB 연결 확인 */
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 연결 실패');
  }
});

/* 카테고리 추가 */
app.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('카테고리 추가 실패');
  }
});

/* 카테고리 조회 */
app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY id'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('카테고리 조회 실패');
  }
});

/* 카테고리 삭제 */
app.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('BEGIN');

    await pool.query(
      'DELETE FROM todos WHERE category_id = $1',
      [id]
    );

    await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );

    await pool.query('COMMIT');

    res.json({ message: '카테고리 삭제 완료' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).send('카테고리 삭제 실패');
  }
});

/* 할 일 추가 */
app.post('/todos', async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      due_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO todos
      (category_id, title, description, due_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        category_id,
        title,
        description,
        due_date,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('할 일 추가 실패');
  }
});

/* 할 일 조회 */
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.*,
        c.name AS category_name
      FROM todos t
      JOIN categories c
      ON t.category_id = c.id
      ORDER BY t.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('할 일 조회 실패');
  }
});

/* 할 일 완료 여부 수정 */
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;

    const result = await pool.query(
      `UPDATE todos
       SET is_completed = $1
       WHERE id = $2
       RETURNING *`,
      [is_completed, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('할 일 수정 실패');
  }
});

/* 할 일 삭제 */
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );

    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).send('할 일 삭제 실패');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});