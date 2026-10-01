import StudentRouteShell from '@/components/StudentRouteShell';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <StudentRouteShell>{children}</StudentRouteShell>;
}
