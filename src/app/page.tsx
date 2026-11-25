import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl" priority />
      <h1 className="text-4xl font-semibold tracking-tight">Due</h1>
      <p className="text-muted">Assignment and form deadlines for your batch, with reminders.</p>
    </main>
  );
}
