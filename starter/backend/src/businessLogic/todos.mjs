import * as uuid from 'uuid';

import { TodosAccess } from "../dataLayer/todosAccess.mjs";

const todosAccess = new TodosAccess();

export async function getTodos(userId) {
  return todosAccess.getTodos(userId);
}