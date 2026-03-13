import React, { useState } from "react";
import "../styles/Settings.css";
import SettingsIcon from "../icons/SettingsIcon.svg";

const settingsOptions = [
    {
        label: "Contraseña",
        detail: "Puedes cambiar tu contraseña para proteger tu cuenta y mantener tu información segura.",
    },
    {
        label: "Correo Electronico",
        detail: "Actualiza tu correo electrónico para recibir notificaciones y recuperar tu cuenta si es necesario.",
    },
    {
        label: "Nombre de usuario",
        detail: "Modifica tu nombre de usuario para personalizar tu perfil en la plataforma.",
    },
];

const Settings: React.FC = () => {
    const [selected, setSelected] = useState<number | null>(null);

    const handleClick = (idx: number) => {
        setSelected(selected === idx ? null : idx);
    };

    return (
        <main className="main-content settings-bg">
            <div className="settings-header">
                <img src={SettingsIcon} className="settings-icon" alt="Settings" />
                <span className="settings-title">Settings</span>
            </div>
            {selected === null ? (
                <div className="settings-list">
                    {settingsOptions.map((opt, idx) => (
                        <div
                            className="settings-item"
                            key={idx}
                            onClick={() => handleClick(idx)}
                            style={{ cursor: "pointer" }}
                        >
                            <span>{opt.label}</span>
                            <span className="settings-arrow">{">"}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div
                        className="settings-item settings-item-active settings-item-expanded"
                        onClick={() => handleClick(selected)}
                        style={{ cursor: "pointer" }}
                    >
                        <span>{settingsOptions[selected].label}</span>
                        <span className="settings-arrow">&#8964;</span>
                    </div>
                    {selected === 0 ? (
                        <form className="settings-form">
                            <div className="settings-form-row">
                                <label>Ingrese su contraseña</label>
                                <input type="password" />
                            </div>
                            <div className="settings-form-row">
                                <label>Ingrese su Nueva contraseña</label>
                                <input type="password" />
                            </div>
                            <div className="settings-form-row">
                                <label>Confirma la nueva contraseña</label>
                                <input type="password" />
                            </div>
                            <button className="settings-form-btn" type="submit">
                                Aceptar Cambios
                            </button>
                        </form>
                    ) : selected === 1 ? (
                        <form className="settings-form">
                            <div className="settings-form-row">
                                <label>Correo Electronico</label>
                                <input type="email" />
                            </div>
                            <div className="settings-form-row">
                                <label>Codigo de verificacion</label>
                                <input type="text" />
                            </div>
                            <button className="settings-form-btn" type="submit">
                                Aceptar Cambios
                            </button>
                        </form>
                    ) : selected === 2 ? (
                        <form className="settings-form">
                            <div className="settings-form-row">
                                <label>Usuario</label>
                                <input type="text" />
                            </div>
                            <div className="settings-form-row">
                                <label>Nombre</label>
                                <input type="text" />
                            </div>
                            <div className="settings-form-row">
                                <label>Apellido</label>
                                <input type="text" />
                            </div>
                            <button className="settings-form-btn" type="submit">
                                Aceptar Cambios
                            </button>
                        </form>
                    ) : (
                        <div className="settings-detail-card" key={selected}>
                            <div className="settings-detail-title">
                                {settingsOptions[selected].label}
                            </div>
                            <div className="settings-detail-description">
                                {settingsOptions[selected].detail}
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default Settings;