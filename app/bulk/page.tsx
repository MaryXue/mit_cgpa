"use client";

import { useState } from "react";
import Papa from "papaparse";
import Statistics from "../components/Statistics";

interface Student {
  Name: string;
  Branch: string;
  Semester: string;
  CGPA: number;
}

export default function BulkSearchPage() {
  const [allData, setAllData] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [nameList, setNameList] = useState("");

  // Load master.csv once
  useState(() => {
    Papa.parse("/master.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];
        const normalized = rawData.map((row) => ({
          Name: row["Student Name"],
          Branch: row["Course Name"],
          Semester: row.Semester || row["Semester No"],
          CGPA: Number(row.CGPA || row.GPA),
        }));
        setAllData(normalized);
      },
    });
  });

  // Handle pasted names
  const handleNameListSearch = () => {
    const names = nameList
      .split(/[\n,]+/)
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setFiltered([]);
      return;
    }

    const matches = allData.filter((row) =>
      names.includes(row.Name.toLowerCase())
    );
    setFiltered(matches);
  };

  // Handle CSV upload
  const handleCSVUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rawNames = results.data as any[];
        const names = rawNames
          .map((row) => Object.values(row)[0]) // assume first column has names
          .map((n: any) => String(n).trim().toLowerCase());

        const matches = allData.filter((row) =>
          names.includes(row.Name.toLowerCase())
        );
        setFiltered(matches);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Bulk Student Search
      </h1>

      <div className="flex flex-col gap-6 max-w-xl">
        {/* Paste names */}
        <div className="flex flex-col gap-2">
          <label className="text-cyan-400">Enter Names</label>
          <textarea
            placeholder="Enter names separated by commas or new lines"
            value={nameList}
            onChange={(e) => setNameList(e.target.value)}
            className="p-2 rounded bg-gray-800 border border-cyan-500 text-white"
            rows={4}
          />
          <button
            onClick={handleNameListSearch}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded"
          >
            Find Students
          </button>
        </div>

        {/* CSV Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-cyan-400">Upload CSV of Names</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleCSVUpload(e.target.files[0]);
              }
            }}
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                       file:text-sm file:font-semibold file:bg-cyan-600 file:text-white
                       hover:file:bg-cyan-500"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 && (
        <>
          <h2 className="text-xl text-cyan-400 mt-8 mb-4">Results</h2>
          <table className="w-full border-collapse border border-cyan-500 text-sm">
            <thead>
              <tr className="bg-gray-800 text-cyan-400">
                <th className="border border-cyan-500 px-2 py-1">Name</th>
                <th className="border border-cyan-500 px-2 py-1">Branch</th>
                <th className="border border-cyan-500 px-2 py-1">Semester</th>
                <th className="border border-cyan-500 px-2 py-1">CGPA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  <td className="border border-cyan-500 px-2 py-1">{row.Name}</td>
                  <td className="border border-cyan-500 px-2 py-1">{row.Branch}</td>
                  <td className="border border-cyan-500 px-2 py-1">{row.Semester}</td>
                  <td className="border border-cyan-500 px-2 py-1">{row.CGPA}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Statistics data={filtered} />
        </>
      )}
    </div>
  );
}
