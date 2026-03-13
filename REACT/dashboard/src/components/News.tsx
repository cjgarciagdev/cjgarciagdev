import React, { useState } from "react";
import "../styles/News.css";
import Mochcoin from "../icons/MochcoinIcon.svg";
import Bitcoin from "../icons/BitcoinIcon.svg";
import lightIcon from "../icons/LightIcon.svg";
import EthereumIcon from "../icons/EthereumIcon.svg";
import SolanaIcon from "../icons/SolanaIcon.svg";

const newsData = [
    {
        title: 'Bitcoin alcanza nuevo máximo histórico',
        text: "Resumen: El precio de Bitcoin supera los $70,000 USD.",
        gradient: "linear-gradient(90deg, #f7931a 0%, #ffcc80 100%)",
        logo: Bitcoin,
        detail: "Bitcoin ha alcanzado un nuevo máximo histórico, superando los $70,000 USD por primera vez. Analistas atribuyen este crecimiento al aumento de la adopción institucional y la escasez de oferta."
    },
    {
        title: 'Ethereum lanza actualización Shanghai',
        text: "Resumen: Mejoras en escalabilidad y reducción de tarifas.",
        gradient: "linear-gradient(90deg, #8e2de2 0%, #4a00e0 100%)",
        logo: EthereumIcon,
        detail: "Ethereum ha implementado la actualización Shanghai, que mejora la escalabilidad y reduce las tarifas de transacción, facilitando el desarrollo de aplicaciones descentralizadas."
    },
    {
        title: 'Solana alcanza récord de transacciones',
        text: "Resumen: Solana supera los 100 millones de transacciones diarias.",
        gradient: "linear-gradient(90deg, #00bfae 0%, #1e3c72 100%)",
        logo: SolanaIcon,
        detail: "Solana ha establecido un nuevo récord al superar los 100 millones de transacciones diarias, consolidándose como una de las blockchains más rápidas y eficientes del mercado."
    },
    {
        title: 'Mochcoin se integra en exchanges globales',
        text: "Resumen: Mochcoin disponible en plataformas internacionales.",
        gradient: "linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)",
        logo: Mochcoin,
        detail: "Mochcoin ha sido listada en varios exchanges internacionales, aumentando su liquidez y permitiendo a más usuarios acceder a la criptomoneda."
    },
    {
        title: 'Nuevas soluciones de energía para minería',
        text: "Resumen: Innovaciones en energía renovable para la minería.",
        gradient: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)",
        logo: lightIcon,
        detail: "Se han presentado nuevas soluciones de energía renovable para la minería de criptomonedas, ayudando a reducir el impacto ambiental y mejorar la sostenibilidad del sector."
    }
];

const News: React.FC = () => {
    const [selected, setSelected] = useState<number | null>(null);

    const handleCardClick = (idx: number) => {
        setSelected(selected === idx ? null : idx);
    };

    return (
        <main className="main-content">
            {/* Si NO hay seleccion, muestra la lista normal */}
            {selected === null ? (
                <div className="news-list">
                    {newsData.map((item, idx) => (
                        <div
                            className="news-card"
                            style={{ background: item.gradient, cursor: "pointer" }}
                            key={idx}
                            onClick={() => handleCardClick(idx)}
                        >
                            <div className="news-info">
                                <div className="news-title">{item.title}</div>
                                <div className="news-text">{item.text}</div>
                            </div>
                            <img src={item.logo} alt="Logo" className="news-logo" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Tarjeta seleccionada */}
                    <div
                        className="news-card news-card-active"
                        style={{ background: newsData[selected].gradient }}
                        onClick={() => handleCardClick(selected)}
                    >
                        <div className="news-info">
                            <div className="news-title">{newsData[selected].title}</div>
                            <div className="news-text">{newsData[selected].text}</div>
                        </div>
                        <img src={newsData[selected].logo} alt="Logo" className="news-logo" />
                    </div>
                    {/* Detalle */}
                    {selected !== null && (
    <div className="news-detail-card" key={selected}>
        <div className="news-title">{newsData[selected].title}</div>
        <div className="news-detail-text">{newsData[selected].detail}</div>
        <img src={newsData[selected].logo} alt="Logo" className="news-logo-detail" />
    </div>
)}
                    {/* Barra de iconos abajo */}
                    <div className="news-icons-bar">
                        {newsData.map((item, idx) =>
                            idx !== selected ? (
                                <img
                                    key={idx}
                                    src={item.logo}
                                    alt="Logo"
                                    className="news-icon-bar-item"
                                    onClick={() => handleCardClick(idx)}
                                    style={{ cursor: "pointer" }}
                                />
                            ) : null
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default News;