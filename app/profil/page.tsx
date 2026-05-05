export default function ProfilPage() {
  return (
    <main className="flex flex-col flex-1 px-6 pt-12 md:pt-20">
      <div className="md:max-w-2xl">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[56px]">
          Profil
        </h1>
        <p className="mt-2 text-[15px] text-ink-2 md:mt-4 md:text-[16px]">
          Logg inn for å lagre felt, logge sendinger og bidra med bilder.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink"
        >
          Logg inn
        </button>
      </div>
    </main>
  );
}
