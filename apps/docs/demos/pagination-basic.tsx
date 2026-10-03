"use client";
import { useState } from "react";
import { Pagination } from "@dafke/ui";

export default function Demo() {
  const [page, setPage] = useState(4);

  return (
    <Pagination
      page={page}
      pageCount={12}
      onPageChange={setPage}
      summary={`Pagina ${page} van 12 · 240 resultaten`}
    />
  );
}
