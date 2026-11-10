import { useEffect, useRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import styles from "./styles.module.css";

const ConfirmDialog = ({ title, description, confirmLabel = "Delete", onCancel, onConfirm }) => {
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);
    const onCancelRef = useRef(onCancel);
    useEffect(() => {
        onCancelRef.current = onCancel;
    }, [onCancel]);
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;
        const previousFocus = document.activeElement;
        (cancelRef.current || dialog.querySelector("button") || dialog).focus();
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCancelRef.current();
                return;
            }
            if (event.key !== "Tab") return;
            const focusable = Array.from(dialog.querySelectorAll("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"))
                .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
            if (!focusable.length) {
                event.preventDefault();
                dialog.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!dialog.contains(document.activeElement)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            const returnFocus = previousFocus instanceof HTMLElement && previousFocus.isConnected
                ? previousFocus
                : document.getElementById("main-content");
            returnFocus?.focus();
        };
    }, []);
    return <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
        <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" tabIndex={-1}>
            <span className={styles.icon}><FiAlertTriangle aria-hidden="true" /></span>
            <h2 id="confirm-title">{title}</h2>
            <p id="confirm-description">{description}</p>
            <div className={styles.actions}><button type="button" ref={cancelRef} onClick={onCancel}>Cancel</button><button type="button" className={styles.confirm} onClick={onConfirm}>{confirmLabel}</button></div>
        </section>
    </div>;
};

export default ConfirmDialog;
