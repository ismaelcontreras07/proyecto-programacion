"use client";
import { useEffect, useState } from "react";
import Link from "next/link";


import EventSection from "../components/events/EventSection";

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
      <EventSection />
    </main>
  );
}
