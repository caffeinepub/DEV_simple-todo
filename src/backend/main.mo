import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type Todo = {
    id : Nat;
    text : Text;
    completed : Bool;
  };

  module Todo {
    public func compare(todo1 : Todo, todo2 : Todo) : Order.Order {
      Nat.compare(todo1.id, todo2.id);
    };
  };

  var nextId = 0;

  let todos = Map.empty<Nat, Todo>();

  public shared ({ caller }) func createTodo(text : Text) : async Todo {
    let newTodo = {
      id = nextId;
      text;
      completed = false;
    };
    todos.add(nextId, newTodo);
    nextId += 1;
    newTodo;
  };

  public query ({ caller }) func getTodos() : async [Todo] {
    todos.values().toArray().sort();
  };

  public shared ({ caller }) func toggleTodo(id : Nat) : async () {
    switch (todos.get(id)) {
      case (null) {
        Runtime.trap("Todo does not exist");
      };
      case (?todo) {
        let updatedTodo = { todo with completed = not todo.completed };
        todos.add(id, updatedTodo);
      };
    };
  };

  public shared ({ caller }) func deleteTodo(id : Nat) : async () {
    if (not todos.containsKey(id)) {
      Runtime.trap("Todo does not exist");
    };
    todos.remove(id);
  };
};
