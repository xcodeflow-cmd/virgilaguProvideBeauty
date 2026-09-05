"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteLiveSession } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteLiveForm({
  id,
  onDeleted,
  buttonClassName = "min-h-11"
}: {
  id: string;
  onDeleted?: (id: string) => void;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(formData: FormData) {
    if (inFlight.current || deleted) return;

    inFlight.current = true;
    setPending(true);
    setError(null);

    try {
      await deleteLiveSession(formData);
      setDeleted(true);
      onDeleted?.(id);
      router.refresh();
    } catch {
      inFlight.current = false;
      setError("Live-ul nu a putut fi sters. Incearca din nou.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleDelete} aria-busy={pending}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" className={buttonClassName} disabled={pending || deleted}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {pending ? "Se sterge..." : deleted ? "Sters" : "Sterge"}
      </Button>
      {error ? <p role="alert" className="mt-2 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
