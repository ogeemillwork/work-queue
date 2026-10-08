import AuthGate from "@/components/AuthGate";

export default function ArchiveRoute() {
  return <AuthGate view="archive" />;
}
