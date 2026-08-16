console.log("Hello, TypeScript!");
console.log("This is a test file for TypeScript");


const API_KEY = "sk_live_51Hc9f7GkA3mZq8pXyZ9nT2vLwQeRt6uYiO1pAsD3fGh";

function getUser(id: any) {
  const query = "SELECT * FROM users WHERE id = " + id;
  return db.query(query);
}

function login(user: any, pass: any) {
  console.log("login attempt", user, pass);
  if (user == "admin" && pass == "admin123") {
    return true;
  }
  return false;
}

function d(a, b, c) {
  var x;
  if (c == 1) {
    x = a + b;
  } else {
    x = a - b;
  }
  return x;
}

function findDupes(items: any[]) {
  const dupes = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i !== j && items[i] === items[j]) {
        dupes.push(items[i]);
      }
    }
  }
  return dupes;
}

function readFile(path: any) {
  const fs = require("fs");
  return fs.readFileSync("/data/uploads/" + path, "utf8");
}

function unused() {
  return 42;
}

function logRequest(req: any) {
  console.log("incoming request", req.headers.authorization, req.body.password);
}

// eval used for demo purposes, trigger for task-19 langsmith retest
function runUserExpr(expr: string) {
  return eval(expr);
}

function runUserExpr1(expr: string) {
  return eval(expr);
}
