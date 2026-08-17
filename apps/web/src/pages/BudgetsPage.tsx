import { useState } from "react";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "../queries/budget.queries";
import { Card }   from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input }  from "../components/ui/Input";
import { Modal }  from "../components/ui/Modal";
import { Badge }  from "../components/ui/Badge";
import { Budget } from "../types";

const SCOPES = ["ORGANIZATION", "DEPARTMENT", "CLOUD_ACCOUNT"];

function BudgetForm({ initial, onSubmit, loading }: {
  initial?: Budget;
  onSubmit: (dto: { name: string; scope: string; monthlyLimit: number }) => void;
  loading:  boolean;
}) {
  const [name,         setName]         = useState(initial?.name ?? "");
  const [scope,        setScope]        = useState(initial?.scope ?? "ORGANIZATION");
  const [monthlyLimit, setMonthlyLimit] = useState(String(initial?.monthlyLimit ?? ""));

  return (
    <div className="space-y-4">
      <Input label="Budget name" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Engineering Monthly"/>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Scope</label>
        <select value={scope} onChange={(e) => setScope(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          {SCOPES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <Input label="Monthly limit (USD)" type="number" value={monthlyLimit}
        onChange={(e) => setMonthlyLimit(e.target.value)} placeholder="5000"/>
      <Button className="w-full justify-center" loading={loading}
        onClick={() => onSubmit({ name, scope, monthlyLimit: Number(monthlyLimit) })}>
        {initial ? "Update budget" : "Create budget"}
      </Button>
    </div>
  );
}

export function BudgetsPage() {
  const { data: budgets, isLoading }   = useBudgets();
  const { mutate: create, isLoading: creating } = useCreateBudget();
  const { mutate: update, isLoading: updating } = useUpdateBudget();
  const { mutate: remove }             = useDeleteBudget();

  const [createOpen, setCreateOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage spending limits across your org</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New budget</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"/>
          ))}
        </div>
      ) : (budgets ?? []).length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No budgets yet. Create one to start tracking.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(budgets ?? []).map((b) => (
            <Card key={b.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{b.name}</h3>
                    <Badge label={b.scope.replace(/_/g, " ")} color="blue"/>
                  </div>
                  <p className="text-sm text-gray-500">
                    Monthly limit: <span className="font-medium text-gray-900 dark:text-white">
                      ${b.monthlyLimit.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditBudget(b)}>Edit</Button>
                  <Button size="sm" variant="danger"    onClick={() => remove(b.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create budget">
        <BudgetForm
          loading={creating}
          onSubmit={(dto) => { create(dto); setCreateOpen(false); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editBudget} onClose={() => setEditBudget(null)} title="Edit budget">
        {editBudget && (
          <BudgetForm
            initial={editBudget}
            loading={updating}
            onSubmit={(dto) => { update({ id: editBudget.id, ...dto }); setEditBudget(null); }}
          />
        )}
      </Modal>
    </div>
  );
}