import { Segmented } from "@/components/motion/segmented";

export function FeedTabs({ active }: { active: "upcoming" | "past" }) {
  return (
    <Segmented
      value={active}
      options={[
        { value: "upcoming", label: "Upcoming", href: "/" },
        { value: "past", label: "Past", href: "/past" },
      ]}
    />
  );
}
