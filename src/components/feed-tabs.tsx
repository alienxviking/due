import Link from "next/link";
import { PlusIcon } from "@/components/ios/icons";
import { Segmented } from "@/components/motion/segmented";

export function FeedTabs({ active }: { active: "upcoming" | "past" }) {
  return (
    <div className="mx-4 mb-5">
      <Segmented
        value={active}
        options={[
          { value: "upcoming", label: "Upcoming", href: "/" },
          { value: "past", label: "Past", href: "/past" },
        ]}
      />
    </div>
  );
}

/** "+" bar button that opens the new-post sheet. */
export function NewPostButton() {
  return (
    <Link href="/new" aria-label="New post" className="-mr-2 flex size-11 items-center justify-center text-tint transition-opacity active:opacity-30">
      <PlusIcon size={26} />
    </Link>
  );
}
