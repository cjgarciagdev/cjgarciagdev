import React from "react";
import "../styles/Wallet.css";

const Wallet: React.FC = () => (
    <main className="main-content">
        <div className="wallet-container">
            <div className="wallet-balance-actions">
                <div className="wallet-balance-card">
                    <div className="wallet-balance-label">TOTAL BALANCE</div>
                    <div className="wallet-balance-value">$***,**</div>
                </div>
                <div className="wallet-actions">
                    <button className="wallet-btn wallet-btn-sell">Vender</button>
                    <button className="wallet-btn wallet-btn-buy">Comprar</button>
                </div>
            </div>

            <div className="wallet-main-row">
                <div className="wallet-card-info">
                    <div className="wallet-card-bg">
                        <div className="wallet-card-title">Vision UI</div>
                        <div className="wallet-card-chip" />
                        <div className="wallet-card-number">7812 2139 0823 XXXX</div>
                        <div className="wallet-card-details">
                            <span>09/24</span>
                            <span>CVV</span>
                            <span>67K</span>
                        </div>
                        <div className="wallet-card-logo1" />
                        <div className="wallet-card-logo2" />
                    </div>
                    <div className="wallet-payment-method">
                        <span>Método de pago</span>
                        <button className="wallet-btn wallet-btn-add">AÑADIR TARJETA</button>
                    </div>
                    <div className="wallet-payment-options">
                        <button className="wallet-btn wallet-btn-option active">Visa 7819 2139 0823</button>
                        <button className="wallet-btn wallet-btn-option">WAL</button>
                        <button className="wallet-btn wallet-btn-option">7819 2139 0823</button>
                    </div>
                </div>

                <div className="wallet-invoices">
                    <div className="wallet-invoices-header">
                        <span>Invoices</span>
                        <button className="wallet-btn wallet-btn-viewall">VIEW ALL</button>
                    </div>
                    <div className="wallet-invoices-list">
                        <div className="wallet-invoice-item">
                            <span>March 01, 2020</span>
                            <span>$85</span>
                        </div>
                        <div className="wallet-invoice-item">
                            <span>February 10, 2021</span>
                            <span>$95</span>
                        </div>
                        <div className="wallet-invoice-item">
                            <span>April 06, 2020</span>
                            <span>$120</span>
                        </div>
                        <div className="wallet-invoice-item">
                            <span>June 25, 2019</span>
                            <span>$60</span>
                        </div>
                        <div className="wallet-invoice-item">
                            <span>March 01, 2019</span>
                            <span>$58</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wallet-bottom-row">
                <div className="wallet-bills-info">
                    <div className="wallet-section-title">informacion de facturas</div>
                    <div className="wallet-bill-list">
                        <div className="wallet-bill-item">
                            <div>
                                <div className="wallet-bill-name">Oliver Liam</div>
                                <div className="wallet-bill-desc">Company: Viking Burrito / March 01, 2020</div>
                            </div>
                            <button className="wallet-btn wallet-btn-delete">DELETE</button>
                        </div>
                        <div className="wallet-bill-item">
                            <div>
                                <div className="wallet-bill-name">Oliver Liam</div>
                                <div className="wallet-bill-desc">Company: Viking Burrito / March 01, 2020</div>
                            </div>
                            <button className="wallet-btn wallet-btn-delete">DELETE</button>
                        </div>
                        <div className="wallet-bill-item">
                            <div>
                                <div className="wallet-bill-name">Oliver Liam</div>
                                <div className="wallet-bill-desc">Company: Viking Burrito / March 01, 2020</div>
                            </div>
                            <button className="wallet-btn wallet-btn-delete">DELETE</button>
                        </div>
                    </div>
                </div>
                <div className="wallet-transactions">
                    <div className="wallet-section-title">Your Transactions</div>
                    <div className="wallet-transactions-list">
                        <div className="wallet-transaction-item">
                            <span className="wallet-transaction-date">27 March 2020, at 12:30 PM</span>
                            <span className="wallet-transaction-amount positive">+$2,500</span>
                        </div>
                        <div className="wallet-transaction-item">
                            <span className="wallet-transaction-date">26 March 2020, at 13:45 PM</span>
                            <span className="wallet-transaction-amount positive">+$1,500</span>
                        </div>
                        <div className="wallet-transaction-item">
                            <span className="wallet-transaction-date">25 March 2020, at 10:00 AM</span>
                            <span className="wallet-transaction-amount negative">-$800</span>
                        </div>
                        <div className="wallet-transaction-item">
                            <span className="wallet-transaction-date">24 March 2020, at 16:30 PM</span>
                            <span className="wallet-transaction-amount pending">Pending</span>
                        </div>
                        <div className="wallet-transaction-item">
                            <span className="wallet-transaction-date">23 March 2020, at 09:47 AM</span>
                            <span className="wallet-transaction-amount negative">-$987</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
);

export default Wallet;