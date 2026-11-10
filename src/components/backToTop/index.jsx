import { FaArrowUp } from "react-icons/fa";
import styles from "./styles.module.css";
const BackToTop = ({ visible }) => visible ? (
    <button className={styles.backToTop} type="button" onClick={() => {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        window.scrollTo({ top: 0, behavior });
    }} aria-label="Back to top">
        <FaArrowUp aria-hidden="true" /><span>Top</span>
    </button>
) : null;
export default BackToTop;
