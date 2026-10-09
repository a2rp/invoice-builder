import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiPlus, FiPrinter, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "paperline-invoice";
const localDate = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};
const defaultInvoice = {
    number: "PL-2026-014", date: localDate(), dueDate: localDate(14), currency: "INR", taxRate: 18,
    seller: "Paperline Studio", sellerEmail: "hello@paperline.studio", sellerAddress: "17, Lake View Road\nBengaluru, Karnataka",
    client: "Avery Design Co.", clientEmail: "accounts@averydesign.co", clientAddress: "42 Market Street\nPune, Maharashtra",
    notes: "Thank you for working with us. Please include the invoice number with your payment.",
    items: [
        { id: 1, description: "Brand identity design", quantity: 1, rate: 28000 },
        { id: 2, description: "Website art direction", quantity: 1, rate: 18000 },
        { id: 3, description: "Icon set and handoff", quantity: 1, rate: 8500 },
    ],
};
const readInvoice = () => {
    try { const saved = localStorage.getItem(storageKey); return saved ? { ...defaultInvoice, ...JSON.parse(saved) } : defaultInvoice; } catch { return defaultInvoice; }
};
const dateText = (value) => value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00")) : "Choose a date";
const currencyText = (value, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value) || 0);

const InvoiceBuilder = () => {
    const [invoice, setInvoice] = useState(readInvoice);
    const [draft, setDraft] = useState({ description: "", quantity: "1", rate: "" });
    const [pendingDelete, setPendingDelete] = useState(null);
    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(invoice)), [invoice]);

    const totals = useMemo(() => {
        const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
        const tax = subtotal * Number(invoice.taxRate) / 100;
        return { subtotal, tax, total: subtotal + tax };
    }, [invoice.items, invoice.taxRate]);
    const update = (key, value) => setInvoice((current) => ({ ...current, [key]: value }));
    const updateItem = (id, key, value) => setInvoice((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item) }));
    const addItem = (event) => {
        event.preventDefault();
        if (!draft.description.trim() || Number(draft.rate) <= 0) return;
        setInvoice((current) => ({ ...current, items: [...current.items, { ...draft, id: Date.now(), description: draft.description.trim(), quantity: Math.max(1, Number(draft.quantity)), rate: Number(draft.rate) }] }));
        setDraft({ description: "", quantity: "1", rate: "" });
    };
    const removeItem = () => {
        setInvoice((current) => ({ ...current, items: current.items.filter((item) => item.id !== pendingDelete.id) }));
        setPendingDelete(null);
    };

    return <section className={styles.invoiceBuilder} id="workspace">
        <div className={styles.titleRow}><div><p className={styles.context}>INVOICE WORKSPACE</p><h1>Make it clear.<br /><span>Make it payable.</span></h1><p className={styles.description}>Shape the details on the left. Your invoice updates as you work.</p></div><div className={styles.localBadge}><FiFileText aria-hidden="true" /><span>Saved in this browser</span></div></div>
        <div className={styles.workspace}>
            <section className={styles.editorPanel} aria-label="Invoice details">
                <div className={styles.editorHeading}><div><h2>Invoice details</h2><p>Keep the payment terms and line items current.</p></div><button type="button" className={styles.printButton} onClick={() => window.print()}><FiPrinter aria-hidden="true" /> Print / PDF</button></div>
                <div className={styles.fieldGrid}>
                    <label>Invoice number<input value={invoice.number} onChange={(event) => update("number", event.target.value)} /></label>
                    <label>Currency<select value={invoice.currency} onChange={(event) => update("currency", event.target.value)}><option value="INR">INR - Rupees</option><option value="USD">USD - Dollars</option><option value="EUR">EUR - Euros</option></select></label>
                    <label>Issue date<input type="date" value={invoice.date} onChange={(event) => update("date", event.target.value)} /></label>
                    <label>Due date<input type="date" value={invoice.dueDate} onChange={(event) => update("dueDate", event.target.value)} /></label>
                </div>
                <div className={styles.partyGrid}>
                    <fieldset><legend>From</legend><label>Your name<input value={invoice.seller} onChange={(event) => update("seller", event.target.value)} /></label><label>Email<input type="email" value={invoice.sellerEmail} onChange={(event) => update("sellerEmail", event.target.value)} /></label><label>Address<textarea rows="2" value={invoice.sellerAddress} onChange={(event) => update("sellerAddress", event.target.value)} /></label></fieldset>
                    <fieldset><legend>Bill to</legend><label>Client name<input value={invoice.client} onChange={(event) => update("client", event.target.value)} /></label><label>Email<input type="email" value={invoice.clientEmail} onChange={(event) => update("clientEmail", event.target.value)} /></label><label>Address<textarea rows="2" value={invoice.clientAddress} onChange={(event) => update("clientAddress", event.target.value)} /></label></fieldset>
                </div>
                <section className={styles.itemEditor} id="items"><div className={styles.itemHeading}><div><h3>Line items</h3><p>Edit a quantity or rate directly.</p></div><label>Tax<select value={invoice.taxRate} onChange={(event) => update("taxRate", Number(event.target.value))}><option value="0">No tax</option><option value="5">GST 5%</option><option value="12">GST 12%</option><option value="18">GST 18%</option><option value="28">GST 28%</option></select></label></div>
                    {invoice.items.map((item) => <div className={styles.itemRow} key={item.id}><label className={styles.itemDescription}>Description<input value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} /></label><label>Qty<input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", Math.max(1, Number(event.target.value)))} /></label><label>Rate<input type="number" min="0" step="0.01" value={item.rate} onChange={(event) => updateItem(item.id, "rate", Math.max(0, Number(event.target.value)))} /></label><strong>{currencyText(item.quantity * item.rate, invoice.currency)}</strong><button type="button" className={styles.removeButton} aria-label={"Remove " + item.description} onClick={() => setPendingDelete(item)}><FiTrash2 aria-hidden="true" /></button></div>)}
                    {invoice.items.length === 0 && <p className={styles.empty}>Add a line item to start your invoice.</p>}
                    <form className={styles.newItem} onSubmit={addItem}><label className={styles.itemDescription}>New item<input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe the work" /></label><label>Qty<input required type="number" min="1" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} /></label><label>Rate<input required type="number" min="0.01" step="0.01" value={draft.rate} onChange={(event) => setDraft({ ...draft, rate: event.target.value })} placeholder="0.00" /></label><button type="submit" aria-label="Add line item"><FiPlus aria-hidden="true" /></button></form>
                </section>
                <label className={styles.notesField}>Payment note<textarea rows="2" value={invoice.notes} onChange={(event) => update("notes", event.target.value)} /></label>
            </section>

            <aside className={styles.previewPanel} id="preview">
                <div className={styles.previewToolbar}><span><i /> Live preview</span><button type="button" onClick={() => window.print()}><FiPrinter aria-hidden="true" /> Print invoice</button></div>
                <article className={styles.invoiceSheet}>
                    <div className={styles.sheetTop}><div><span className={styles.brandMark}>P</span><strong>{invoice.seller || "Your business"}</strong></div><span>INVOICE</span></div>
                    <div className={styles.invoiceTitle}><div><p>INVOICE FOR</p><h2>{invoice.client || "Client name"}</h2><span>{invoice.clientEmail}</span><small>{invoice.clientAddress}</small></div><strong>{invoice.number || "DRAFT"}</strong></div>
                    <div className={styles.dateGrid}><div><span>ISSUED</span><strong>{dateText(invoice.date)}</strong></div><div><span>PAYMENT DUE</span><strong>{dateText(invoice.dueDate)}</strong></div><div><span>FROM</span><strong>{invoice.seller || "Your business"}</strong><small>{invoice.sellerEmail}</small><small>{invoice.sellerAddress}</small></div></div>
                    <div className={styles.sheetTable}><table><thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead><tbody>{invoice.items.map((item) => <tr key={item.id}><td>{item.description || "Work item"}</td><td>{item.quantity}</td><td>{currencyText(item.rate, invoice.currency)}</td><td>{currencyText(item.quantity * item.rate, invoice.currency)}</td></tr>)}</tbody></table></div>
                    <div className={styles.totalBlock}><div><span>Subtotal</span><strong>{currencyText(totals.subtotal, invoice.currency)}</strong></div><div><span>Tax ({invoice.taxRate}%)</span><strong>{currencyText(totals.tax, invoice.currency)}</strong></div><div className={styles.grandTotal}><span>Total due</span><strong>{currencyText(totals.total, invoice.currency)}</strong></div></div>
                    <div className={styles.paymentNote}><span>PAYMENT NOTE</span><p>{invoice.notes || "Thank you for your business."}</p></div>
                    <div className={styles.sheetFooter}>Prepared with Paperline <span>{invoice.number}</span></div>
                </article>
            </aside>
        </div>
        {pendingDelete && <ConfirmDialog title="Remove this line item?" description={'"' + pendingDelete.description + '" will be removed from this invoice.'} confirmLabel="Remove item" onCancel={() => setPendingDelete(null)} onConfirm={removeItem} />}
    </section>;
};
export default InvoiceBuilder;