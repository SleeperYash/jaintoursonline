import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContacts from "./FloatingContacts";
import PremiumLoader from "./PremiumLoader";

const SiteLayout = ({
  children,
  hideFloatingContacts = false,
}: {
  children: ReactNode;
  hideFloatingContacts?: boolean;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>{children}</main>
      <Footer />
      {!hideFloatingContacts && <FloatingContacts />}
    </div>
  );
};

export default SiteLayout;
