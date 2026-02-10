"use client";

import { Main } from "next/document";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:8000/api/data")
      .then((res) => res.json())
      .then((data) => setData(data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>isis clasista</h1>
    </main>
  );
}
