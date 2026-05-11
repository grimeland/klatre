import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Logg inn — Felt",
};

export default function LoggInnPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 pt-16 md:pt-28">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-tight text-ink md:text-[52px]">
          Logg inn
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2 md:text-[16px]">
          Skriv inn e-posten din, så sender vi deg en lenke. Klikk på den for å
          komme inn — ingen passord.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
