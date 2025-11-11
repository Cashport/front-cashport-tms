import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import Wrapper from "@/components/organisms/wrapper/Wrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ViewWrapper headerTitle="">{children}</ViewWrapper>;
}
