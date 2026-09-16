import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useResources } from "../queries/resource.queries";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { TableSkeleton } from "../components/ui/Skeleton";

const TYPES = [
  "",
  "VIRTUAL_MACHINE",
  "DATABASE",
  "STORAGE_BUCKET",
  "LOAD_BALANCER",
  "KUBERNETES_CLUSTER",
  "SERVERLESS_FUNCTION",
];

const PROVIDERS = ["", "AWS", "AZURE", "GCP"];

const providerColor: Record<
  string,
  "yellow" | "blue" | "green"
> = {
  AWS: "yellow",
  AZURE: "blue",
  GCP: "green",
};

export function ResourcesPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: "",
    provider: "",
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useResources(filters);

  const set = (
    key: keyof typeof filters,
    value: string | number
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key !== "page" ? 1 : Number(value),
    }));
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div>
        <h1 className="text-2xl font-bold">
          Resources
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          All cloud resources across connected accounts
        </p>
      </div>


      {/* ================= FILTERS ================= */}

      <Card>
        <div className="flex flex-wrap gap-3">

          {/* Resource Type */}

          <select
            value={filters.type}
            onChange={(e) =>
              set("type", e.target.value)
            }
            className="
              px-3 py-2 rounded-lg
              border border-gray-300
              dark:border-gray-700
              bg-white dark:bg-gray-900
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-brand-500
            "
          >
            {TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type
                  ? type.replace(/_/g, " ")
                  : "All Types"}
              </option>
            ))}
          </select>


          {/* Provider */}

          <select
            value={filters.provider}
            onChange={(e) =>
              set("provider", e.target.value)
            }
            className="
              px-3 py-2 rounded-lg
              border border-gray-300
              dark:border-gray-700
              bg-white dark:bg-gray-900
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-brand-500
            "
          >
            {PROVIDERS.map((provider) => (
              <option
                key={provider}
                value={provider}
              >
                {provider || "All Providers"}
              </option>
            ))}
          </select>


          {/* Clear Filters */}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFilters({
                type: "",
                provider: "",
                page: 1,
                limit: 20,
              })
            }
          >
            Clear filters
          </Button>

        </div>
      </Card>


      {/* ================= RESOURCE TABLE ================= */}

      <Card padding={false}>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            {/* ---------- TABLE HEADER ---------- */}

            <thead>

              <tr className="border-b border-gray-200 dark:border-gray-800">

                {[
                  "Resource",
                  "Type",
                  "Region",
                  "Provider",
                  "Monthly Cost",
                  "Alerts",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="
                      text-left
                      px-6 py-3
                      text-xs
                      font-semibold
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    {heading}
                  </th>
                ))}

              </tr>

            </thead>


            {/* ---------- TABLE BODY ---------- */}

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

              {/* Loading */}

              {isLoading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-4"
                  >
                    <TableSkeleton rows={8} />
                  </td>

                </tr>

              ) : (

                /* Resources */

                (data?.data ?? []).map((resource) => (

                  <tr
                    key={resource.id}
                    className="
                      hover:bg-gray-50
                      dark:hover:bg-gray-800/50
                      transition-colors
                    "
                  >

                    {/* ================= RESOURCE ================= */}

                    <td className="px-6 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/resources/${resource.id}`
                          )
                        }
                        className="
                          font-medium
                          text-brand-600
                          hover:underline
                          cursor-pointer
                          text-left
                        "
                      >
                        {resource.name}
                      </button>

                      <p className="text-xs text-gray-400">
                        {resource.accountName}
                      </p>

                    </td>


                    {/* ================= TYPE ================= */}

                    <td className="px-6 py-4 text-gray-500">

                      {resource.type.replace(
                        /_/g,
                        " "
                      )}

                    </td>


                    {/* ================= REGION ================= */}

                    <td className="px-6 py-4 text-gray-500">

                      {resource.region ?? "—"}

                    </td>


                    {/* ================= PROVIDER ================= */}

                    <td className="px-6 py-4">

                      <Badge
                        label={resource.provider}
                        color={
                          providerColor[
                            resource.provider
                          ] ?? "gray"
                        }
                      />

                    </td>


                    {/* ================= COST ================= */}

                    <td className="px-6 py-4 font-medium">

                      $
                      {resource.currentMonthCost.toFixed(
                        2
                      )}

                    </td>


                    {/* ================= ALERT ================= */}

                    <td className="px-6 py-4">

                      {resource.hasOpenAlerts ? (

                        <Badge
                          label="Open alerts"
                          color="red"
                        />

                      ) : (

                        <Badge
                          label="Clear"
                          color="green"
                        />

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* ================= PAGINATION ================= */}

        {data?.pagination && (

          <div
            className="
              flex
              items-center
              justify-between
              px-6 py-4
              border-t
              border-gray-100
              dark:border-gray-800
            "
          >

            {/* Total */}

            <p className="text-sm text-gray-500">

              {data.pagination.total} total resources

            </p>


            {/* Buttons */}

            <div className="flex gap-2">

              <Button
                size="sm"
                variant="secondary"
                disabled={filters.page <= 1}
                onClick={() =>
                  set(
                    "page",
                    filters.page - 1
                  )
                }
              >
                Previous
              </Button>


              <span className="px-3 py-1.5 text-sm">

                {filters.page} /{" "}
                {data.pagination.totalPages}

              </span>


              <Button
                size="sm"
                variant="secondary"
                disabled={
                  filters.page >=
                  data.pagination.totalPages
                }
                onClick={() =>
                  set(
                    "page",
                    filters.page + 1
                  )
                }
              >
                Next
              </Button>

            </div>

          </div>

        )}

      </Card>

    </div>
  );
}