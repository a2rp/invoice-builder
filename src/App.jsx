import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import InvoiceBuilder from "./components/invoiceBuilder";

const repository = "https://github.com/a2rp/invoice-builder";
const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return <div className={styles["app-shell"]} id="top">
        <SiteHeader title="Paperline" mark="P" navItems={[["Invoice", "#workspace"], ["Items", "#items"], ["Preview", "#preview"]]} repoUrl={repository} />
        <main className={styles["page-content"]}><InvoiceBuilder /></main>
        <SiteFooter repoUrl={repository} />
        <BackToTop visible={showBackToTop} />
    </div>;
};
export default App;