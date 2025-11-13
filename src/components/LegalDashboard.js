import React, { useState } from "react";
import LegalCreateForm from "./LegalCreateForm";
import LegalList from "./LegalList";
import LegalDetail from "./LegalDetail";
import AvaluosPDFTab from "./AvaluosPDFTab"; // 🆕 Importación añadida

const LegalDashboard = () => {
  const [tab, setTab] = useState("crear"); // "crear" | "consultar" | "avaluos"
  const [tipo, setTipo] = useState("certificacion"); // "certificacion" | "escritura"
  const [selected, setSelected] = useState(null); // { id, ... } o null

  return (
    <div className="container py-3" style={{ maxWidth: 980 }}>
      {/* 🔹 Header acciones */}
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className={`btn ${tab === "crear" ? "btn-secondary" : "btn-outline-secondary"}`}
          onClick={() => { setSelected(null); setTab("crear"); }}
        >
          Crear registro
        </button>

        <button
          type="button"
          className={`btn ${tab === "consultar" ? "btn-secondary" : "btn-outline-secondary"}`}
          onClick={() => { setSelected(null); setTab("consultar"); }}
        >
          Consultar registro
        </button>

        {/* 🆕 Nueva pestaña Avalúos PDF */}
        <button
          type="button"
          className={`btn ${tab === "avaluos" ? "btn-secondary" : "btn-outline-secondary"}`}
          onClick={() => { setSelected(null); setTab("avaluos"); }}
        >
          Avalúos PDF
        </button>
      </div>

      {/* 🔹 Selector de tipo */}
      {!selected && tab !== "avaluos" && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title mb-3">Seleccione tipo de documento</h6>
            <div className="d-flex align-items-center gap-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  id="tipoCert"
                  type="radio"
                  name="tipo"
                  value="certificacion"
                  checked={tipo === "certificacion"}
                  onChange={() => setTipo("certificacion")}
                />
                <label htmlFor="tipoCert" className="form-check-label">
                  Certificación
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  id="tipoEsc"
                  type="radio"
                  name="tipo"
                  value="escritura"
                  checked={tipo === "escritura"}
                  onChange={() => setTipo("escritura")}
                />
                <label htmlFor="tipoEsc" className="form-check-label">
                  Escritura
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Panel principal */}
      <div className="card">
        <div className="card-body">
          {selected ? (
            <LegalDetail id={selected.id} onBack={() => setSelected(null)} />
          ) : tab === "crear" ? (
            <>
              <h5 className="mb-3">Formulario: {tipo}</h5>
              <LegalCreateForm tipo={tipo} onCreated={() => setTab("consultar")} />
            </>
          ) : tab === "consultar" ? (
            <>
              <h5 className="mb-3">Listado: {tipo}</h5>
              <LegalList tipo={tipo} onSelect={(row) => setSelected(row)} />
            </>
          ) : (
            <>
              <h5 className="mb-3">Avalúos completados</h5>
              <AvaluosPDFTab />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDashboard;
