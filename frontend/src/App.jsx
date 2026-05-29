import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [categories, setCategories] = useState([]);
  const [todos, setTodos] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const completedCount = todos.filter(
    (todo) => todo.is_completed
  ).length;

  const incompleteCount =
    todos.length - completedCount;

  const loadCategories = async () => {
    const res = await axios.get('http://localhost:3000/categories');
    setCategories(res.data);
  };

  const loadTodos = async () => {
    const res = await axios.get('http://localhost:3000/todos');
    setTodos(res.data);
  };

  useEffect(() => {
    loadCategories();
    loadTodos();
  }, []);

  const addCategory = async () => {
    if (!categoryName) return;

    await axios.post('http://localhost:3000/categories', {
      name: categoryName,
    });

    setCategoryName('');
    loadCategories();
  };

  const deleteCategory = async (id) => {
    await axios.delete(`http://localhost:3000/categories/${id}`);
    loadCategories();
    loadTodos();
  };

  const addTodo = async () => {
    if (!selectedCategory || !title) return;

    await axios.post('http://localhost:3000/todos', {
      category_id: selectedCategory,
      title,
      description,
      due_date: dueDate,
    });

    setTitle('');
    setDescription('');
    setDueDate('');

    loadTodos();
  };

  const toggleComplete = async (todo) => {
    await axios.put(`http://localhost:3000/todos/${todo.id}`, {
      is_completed: !todo.is_completed,
    });

    loadTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:3000/todos/${id}`);
    loadTodos();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Todo</h1>

      <hr />

      <h2>카테고리</h2>

      <input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="카테고리 이름"
      />

      <button onClick={addCategory}>추가</button>

      <br />
      <br />

      {categories.map((category) => (
        <div key={category.id} className="category-item">
          {category.name}

          <button
            style={{ marginLeft: '10px' }}
            onClick={() => deleteCategory(category.id)}
          >
            삭제
          </button>
        </div>
      ))}

      <hr />

      <h2>할 일</h2>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">카테고리 선택</option>

        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />

      <br />
      <br />

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명"
      />

      <br />
      <br />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addTodo}>추가</button>

      <hr />

      <h2>할 일 목록</h2>

      <div className="todo-card">
        <p>총 할 일: {todos.length}개</p>
        <p>완료: {completedCount}개</p>
        <p>미완료: {incompleteCount}개</p>
      </div>

      <br />

      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="all">전체</option>

        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      {todos
        .filter((todo) =>
          filterCategory === 'all'
            ? true
            : todo.category_id === Number(filterCategory)
        )
        .map((todo) => (
          <div key={todo.id} className="todo-card">
            <h3>{todo.title}</h3>

            <p>{todo.description}</p>

            <p>카테고리: {todo.category_name}</p>

            <p>
              마감일:{' '}
              {todo.due_date
                ? todo.due_date.slice(0, 10)
                : '없음'}
            </p>

            <p>
              상태:
              <span
                className={
                  todo.is_completed
                    ? 'completed'
                    : 'not-completed'
                }
              >
                {todo.is_completed ? ' 완료' : ' 미완료'}
              </span>
            </p>

            <button onClick={() => toggleComplete(todo)}>
              완료 변경
            </button>

            <button
              style={{ marginLeft: '10px' }}
              onClick={() => deleteTodo(todo.id)}
            >
              삭제
            </button>
          </div>
        ))}
    </div>
  );
}

export default App;