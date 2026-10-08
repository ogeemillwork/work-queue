import AuthGate from "@/components/AuthGate";

function decode(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export default function JobRoute({ params }: { params: { id: string } }) {
  return <AuthGate jobId={decode(params.id)} />;
}
