const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
var isValid = require("date-fns/isValid");
var format = require("date-fns/format");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasStatusAndCategoryProperty = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};

const hasPriorityAndStatusAndCategotyProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined &&
    requestQuery.category !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const validatePriority = (request, response, next) => {
  const { priority } = request.body;

  if (priority !== undefined) {
    if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};

const validateStatus = (request, response, next) => {
  const { status } = request.body;

  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};

const validateCategory = (request, response, next) => {
  const { category } = request.body;

  if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};

const validateDate = (request, response, next) => {
  const { dueDate } = request.body;

  if (dueDate !== undefined) {
    if (isValid(new Date(dueDate))) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};

const validatePriorityQuery = (request, response, next) => {
  const { priority } = request.query;

  if (priority !== undefined) {
    if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};

const validateCategoryQuery = (request, response, next) => {
  const { category } = request.query;

  if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};

const validateStatusQuery = (request, response, next) => {
  const { status } = request.query;
  console.log(status);
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};

const validateDateQuery = (request, response, next) => {
  const { date } = request.query;

  if (date !== undefined) {
    if (isValid(new Date(date))) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};

const formattedData = (data) => {
  return {
    id: data.id,
    todo: data.todo,
    priority: data.priority,
    status: data.status,
    category: data.category,
    dueDate: data.due_date,
  };
};

app.get(
  "/todos/",
  validatePriorityQuery,
  validateCategoryQuery,
  validateStatusQuery,
  async (request, response) => {
    let data = null;
    let getTodosQuery = "";
    const { search_q = "", priority, status, category } = request.query;

    switch (true) {
      case hasPriorityAndStatusAndCategotyProperties(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}'
        AND category = '${category}';`;
        break;

      case hasPriorityAndStatusProperties(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        break;
      case hasCategoryAndPriorityProperty(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
        break;
      case hasStatusAndCategoryProperty(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        break;
      case hasPriorityProperty(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        break;
      case hasCategoryProperty(request.query):
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'

        AND category = '${category}';`;
        break;
      case hasStatusProperty(request.query):
        console.log(status);
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        break;
      default:
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
    }

    const todoDataArray = await database.all(getTodosQuery);
    response.send(todoDataArray.map((todoData) => formattedData(todoData)));
  }
);

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(request.params);
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(formattedData(todo));
});

app.get("/agenda/", validateDateQuery, async (request, response) => {
  const { date } = request.query;

  var result = format(new Date(date), "yyyy-MM-dd");

  const getTodoDateQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${result}';`;
  const todoDataArray = await database.all(getTodoDateQuery);

  response.send(todoDataArray.map((todoData) => formattedData(todoData)));
});

app.post(
  "/todos/",
  validatePriority,
  validateStatus,
  validateCategory,
  validateDate,
  async (request, response) => {
    const { id, todo, priority, status, dueDate, category } = request.body;
    var result = format(new Date(dueDate), "yyyy-MM-dd");
    const postTodoQuery = `
  INSERT INTO
    todo (id, todo,category, priority, status,due_date)
  VALUES
    ('${id}', '${todo}', '${category}', '${priority}', '${status}', '${result}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
);

app.put(
  "/todos/:todoId/",
  validatePriority,
  validateStatus,
  validateCategory,
  validateDate,
  async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    switch (true) {
      case requestBody.status !== undefined:
        updateColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updateColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updateColumn = "Todo";
        break;
      case requestBody.category !== undefined:
        updateColumn = "Category";
        break;
      case requestBody.dueDate !== undefined:
        updateColumn = "Due Date";
        break;
    }
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = '${todoId}';`;
    const previousTodo = await database.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      category = previousTodo.category,
      priority = previousTodo.priority,
      status = previousTodo.status,
      dueDate = previousTodo.dueDate,
    } = request.body;

    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      category='${category}',
      priority='${priority}',
      status='${status}',
      due_date='${dueDate}'
    WHERE
      id = '${todoId}';`;

    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  }
);

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = '${todoId}';`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
