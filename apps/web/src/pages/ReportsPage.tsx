import { useState } from "react";
import { useReports, useGenerateReport } from "../queries/report.queries";
import { api } from "../lib/axios";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";

const TYPES = ["COST_SUMMARY", "RESOURCE_INVENTORY"];
const FORMATS = ["PDF", "EXCEL", "CSV"];

const formatColor: Record<string, "red" | "green" | "blue"> = {
  PDF: "red",
  EXCEL: "green",
  CSV: "blue",
};

export function ReportsPage() {
  const { data: reports, isLoading } = useReports();

  const {
    mutate: generate,
    isLoading: generating,
  } = useGenerateReport();

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    type: "COST_SUMMARY",
    format: "PDF",
    from: "",
    to: "",
  });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --------------------------------------------------
  // DOWNLOAD REPORT
  // --------------------------------------------------
  const handleDownload = async (id: string, format: string) => {
    try {
      setDownloadingId(id);

      const response = await api.get(
        `/reports/${id}/download`,
        {
          responseType: "blob",
        }
      );

      // Create temporary URL for downloaded file
      const blob = new Blob(
        [response.data],
        {
          type:
  String(response.headers["content-type"] || getMimeType(format)),
        }
      );

      const url = window.URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from backend
      const contentDisposition =
        response.headers["content-disposition"];

      let filename = `cloudcost-report.${getExtension(format)}`;

      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename="?([^"]+)"?/i
        );

        if (match?.[1]) {
          filename = match[1];
        }
      }

      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report download failed:", error);

      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // --------------------------------------------------
  // MIME TYPE
  // --------------------------------------------------
  const getMimeType = (format: string) => {
    switch (format) {
      case "PDF":
        return "application/pdf";

      case "EXCEL":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      case "CSV":
        return "text/csv";

      default:
        return "application/octet-stream";
    }
  };

  // --------------------------------------------------
  // FILE EXTENSION
  // --------------------------------------------------
  const getExtension = (format: string) => {
    switch (format) {
      case "PDF":
        return "pdf";

      case "EXCEL":
        return "xlsx";

      case "CSV":
        return "csv";

      default:
        return "file";
    }
  };

  // --------------------------------------------------
  // GENERATE REPORT
  // --------------------------------------------------
  const handleGenerate = () => {
    generate(
      {
        ...form,
        from: form.from || undefined,
        to: form.to || undefined,
      },
      {
        onSuccess: () => {
          setModalOpen(false);

          // Reset form
          setForm({
            type: "COST_SUMMARY",
            format: "PDF",
            from: "",
            to: "",
          });
        },
        onError: (error) => {
          console.error("Report generation failed:", error);
          alert("Failed to generate report.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Reports
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Generate and download PDF, Excel, and CSV reports
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
        >
          + Generate report
        </Button>
      </div>

      {/* =====================================================
          REPORT LIST
      ====================================================== */}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"
            />
          ))}
        </div>

      ) : (reports ?? []).length === 0 ? (

        <Card>
          <p className="text-center text-gray-500 py-8">
            No reports generated yet. Click "Generate report"
            to create one.
          </p>
        </Card>

      ) : (

        <Card padding={false}>
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              {/* TABLE HEADER */}
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">

                  {[
                    "Format",
                    "Generated by",
                    "Created",
                    "Download",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}

                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                {(reports ?? []).map((r) => (

                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >

                    {/* FORMAT */}
                    <td className="px-6 py-4">
                      <Badge
                        label={r.format}
                        color={
                          formatColor[r.format] ?? "blue"
                        }
                      />
                    </td>

                    {/* GENERATED BY */}
                    <td className="px-6 py-4 text-gray-500">
                      {r.generatedBy}
                    </td>

                    {/* CREATED */}
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(
                        r.createdAt
                      ).toLocaleString()}
                    </td>

                    {/* DOWNLOAD */}
                    <td className="px-6 py-4">

                      <button
                        type="button"
                        disabled={downloadingId === r.id}
                        onClick={() =>
                          handleDownload(
                            r.id,
                            r.format
                          )
                        }
                        className={`text-brand-600 hover:underline text-sm font-medium ${
                          downloadingId === r.id
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {downloadingId === r.id
                          ? "Downloading..."
                          : "Download"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </Card>

      )}

      {/* =====================================================
          GENERATE REPORT MODAL
      ====================================================== */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Report"
        footer={
          <Button
            loading={generating}
            onClick={handleGenerate}
          >
            Generate
          </Button>
        }
      >

        <div className="space-y-4">

          {/* REPORT TYPE */}
          <div>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Report type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >

              {TYPES.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t.replace(/_/g, " ")}
                </option>
              ))}

            </select>

          </div>

          {/* FORMAT */}
          <div>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Format
            </label>

            <div className="flex gap-2">

              {FORMATS.map((f) => (

                <button
                  key={f}
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      format: f,
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.format === f
                      ? "bg-brand-600 text-white border-brand-600"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {f}
                </button>

              ))}

            </div>

          </div>

          {/* DATE RANGE */}
          <div className="grid grid-cols-2 gap-3">

            {/* FROM */}
            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                From (optional)
              </label>

              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    from: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            {/* TO */}
            <div>

              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                To (optional)
              </label>

              <input
                type="date"
                value={form.to}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    to: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

          </div>

        </div>

      </Modal>

    </div>
  );
}