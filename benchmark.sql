SELECT
t.*,
c.name
FROM todos t
JOIN categories c
ON t.category_id = c.id;