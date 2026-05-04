import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContacts from "./FloatingContacts";

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContacts />
    </div>
  );
};

export default SiteLayout;
