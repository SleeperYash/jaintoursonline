import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContacts from "./FloatingContacts";
import PremiumLoader from "./PremiumLoader";
import ChatWidget from "./ChatWidget";

const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PremiumLoader />
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContacts />
      <ChatWidget />
    </div>
  );
};

export default SiteLayout;
