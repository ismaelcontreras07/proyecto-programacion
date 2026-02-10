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
    <main>
      <h1>Hola Celic, ya no seas clasista</h1>
    </main>
  );
}
