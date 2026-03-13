import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateTodo,
  useDeleteTodo,
  useGetTodos,
  useToggleTodo,
} from "./hooks/useQueries";

type Filter = "all" | "active" | "completed";

export default function App() {
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const { data: todos = [], isLoading } = useGetTodos();
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  async function handleAdd() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await createTodo.mutateAsync(text);
    } catch {
      toast.error("Failed to add todo");
      setInput(text);
    }
  }

  async function handleToggle(id: bigint) {
    try {
      await toggleTodo.mutateAsync(id);
    } catch {
      toast.error("Failed to update todo");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteTodo.mutateAsync(id);
      toast.success("Todo removed");
    } catch {
      toast.error("Failed to delete todo");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground leading-none">
              My Todos
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-8">
        {/* Add input */}
        <div className="flex gap-2 mb-6">
          <Input
            data-ocid="todo.input"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            disabled={createTodo.isPending}
          />
          <Button
            data-ocid="todo.add_button"
            onClick={handleAdd}
            disabled={!input.trim() || createTodo.isPending}
            className="h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createTodo.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Filters */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          className="mb-4"
        >
          <TabsList className="w-full bg-muted">
            <TabsTrigger
              value="all"
              data-ocid="todo.filter.tab"
              className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              All
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({todos.length})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              data-ocid="todo.filter.tab"
              className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              Active
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({activeCount})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              data-ocid="todo.filter.tab"
              className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              Done
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({todos.length - activeCount})
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading */}
        {isLoading && (
          <div data-ocid="todo.loading_state" className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            data-ocid="todo.empty_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-display text-lg font-medium text-foreground">
              {filter === "all"
                ? "Nothing here yet"
                : filter === "active"
                  ? "No active tasks"
                  : "No completed tasks"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all"
                ? "Add your first task above to get started."
                : "Switch filters to see other tasks."}
            </p>
          </motion.div>
        )}

        {/* Todo list */}
        {!isLoading && filtered.length > 0 && (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((todo, idx) => (
                <motion.li
                  key={String(todo.id)}
                  data-ocid={`todo.item.${idx + 1}`}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-xs group"
                >
                  <button
                    type="button"
                    data-ocid={`todo.checkbox.${idx + 1}`}
                    onClick={() => handleToggle(todo.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={
                      todo.completed ? "Mark incomplete" : "Mark complete"
                    }
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <span
                    className={[
                      "flex-1 text-sm leading-snug transition-all duration-300",
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {todo.text}
                  </span>

                  <button
                    type="button"
                    data-ocid={`todo.delete_button.${idx + 1}`}
                    onClick={() => handleDelete(todo.id)}
                    className="flex-shrink-0 p-1.5 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Delete todo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
