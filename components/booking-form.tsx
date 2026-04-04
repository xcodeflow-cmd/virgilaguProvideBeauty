"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BookingForm() {
  const [status, setStatus] = useState<string | null>(null);

  return (
    <form
      className="glass-panel gold-ring space-y-5 rounded-[2rem] p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const response = await fetch("/api/bookings", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries())),
          headers: {
            "Content-Type": "application/json"
          }
        });

        setStatus(response.ok ? "Booking request sent." : "Booking request failed.");
        if (response.ok) form.reset();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Name" className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45" />
        <input name="email" type="email" required placeholder="Email" className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45" />
        <input name="phone" placeholder="Phone" className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45" />
        <input name="service" required placeholder="Service" className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45" />
        <input name="preferredAt" type="datetime-local" required className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45 sm:col-span-2" />
      </div>
      <textarea name="notes" placeholder="Notes" rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold/45" />
      <Button type="submit">Request Booking</Button>
      {status ? <p className="text-sm text-gold-light">{status}</p> : null}
    </form>
  );
}
