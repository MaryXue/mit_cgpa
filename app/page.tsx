"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import Statistics from "./components/Statistics";

interface Student {
  Name: string;
  Branch: string;
  Semester: string;
  CGPA: number;
}

export default function Home() {
  const [data, setData] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  // filters
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [cgpaMin, setCgpaMin] = useState("");
  const [cgpaMax, setCgpaMax] = useState("");
  const [sortBy, setSortBy] = useState("cgpa-desc");

  const [nameList, setNameList] = useState("");

  const handleNameListSearch = () => {
    const names = nameList
      .split(/[\n,]+/) // split on commas or newlines
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setFiltered(data);
      return;
    }

    const matches = data.filter((row) =>
      names.includes(row.Name.toLowerCase())
    );
    setFiltered(matches);
  };

  useEffect(() => {
    Papa.parse("/master.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];

        const normalized: Student[] = rawData.map((row) => ({
          Name: row["Student Name"],
          Branch: row["Course Name"],
          Semester: row.Semester || row["Semester No"] || row.Sem,
          CGPA: parseFloat(row.CGPA || row.GPA || row["CGPA"]),
        }));

        // Sort descending by default
        const sorted = [...normalized].sort((a, b) => b.CGPA - a.CGPA);

        setData(sorted);
        setFiltered(sorted);

        // Extract unique branches + semesters
        setBranches(Array.from(new Set(normalized.map((r) => r.Branch))));
        setSemesters(Array.from(new Set(normalized.map((r) => r.Semester))));
      },
    });
  }, []);

  useEffect(() => {
    let updated = [...data];

    // Name filter
    if (nameFilter) {
      updated = updated.filter((row) =>
        row.Name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Branch filter
    if (branchFilter !== "All") {
      updated = updated.filter((row) => row.Branch === branchFilter);
    }

    // Semester filter
    if (semesterFilter !== "All") {
      updated = updated.filter((row) => row.Semester === semesterFilter);
    }

    // CGPA min/max
    if (cgpaMin) {
      updated = updated.filter((row) => row.CGPA >= parseFloat(cgpaMin));
    }
    if (cgpaMax) {
      updated = updated.filter((row) => row.CGPA <= parseFloat(cgpaMax));
    }

    // Sorting
    if (sortBy === "cgpa-asc") updated.sort((a, b) => a.CGPA - b.CGPA);
    else if (sortBy === "cgpa-desc") updated.sort((a, b) => b.CGPA - a.CGPA);
    else if (sortBy === "name-asc")
      updated.sort((a, b) => a.Name.localeCompare(b.Name));
    else if (sortBy === "name-desc")
      updated.sort((a, b) => b.Name.localeCompare(a.Name));

    setFiltered(updated);
  }, [nameFilter, branchFilter, semesterFilter, cgpaMin, cgpaMax, sortBy, data]);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <h1 className="text-4xl font-bold mb-6 text-pink-500 drop-shadow-lg">
        🎓 GPA Dashboard
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {/* Name search */}
        <input
          type="text"
          placeholder="Search name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        />

        {/* Branch dropdown */}
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        >
          <option value="All">All Branches</option>
          {branches.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Semester dropdown */}
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        >
          <option value="All">All Semesters</option>
          {semesters.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* CGPA min */}
        <input
          type="number"
          placeholder="Min CGPA"
          value={cgpaMin}
          onChange={(e) => setCgpaMin(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        />

        {/* CGPA max */}
        <input
          type="number"
          placeholder="Max CGPA"
          value={cgpaMax}
          onChange={(e) => setCgpaMax(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        />

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-pink-500 text-green-300 focus:outline-none"
        >
          <option value="none">None</option>
          <option value="cgpa-asc">CGPA ↑</option>
          <option value="cgpa-desc">CGPA ↓</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-pink-500 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-800 text-pink-400">
            <tr>
              <th className="border border-pink-500 px-3 py-2">S.No.</th>
              <th className="border border-pink-500 px-3 py-2">Name</th>
              <th className="border border-pink-500 px-3 py-2">Branch</th>
              <th className="border border-pink-500 px-3 py-2">Semester</th>
              <th className="border border-pink-500 px-3 py-2">CGPA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-700 hover:text-pink-300 transition"
              >
                <td className="border border-pink-500 px-3 py-2">{i + 1}</td>
                <td className="border border-pink-500 px-3 py-2">{row.Name}</td>
                <td className="border border-pink-500 px-3 py-2">{row.Branch}</td>
                <td className="border border-pink-500 px-3 py-2">{row.Semester}</td>
                <td className="border border-pink-500 px-3 py-2">{row.CGPA}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Statistics data={filtered} />
    </div>
  );
}
