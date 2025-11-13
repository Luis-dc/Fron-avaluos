import React, { useEffect, useState } from "react";
import axios from "axios";
import TerrenoTab from "./TerrenoTab";
import ReferencialesTab from "./ReferencialesTab";
import ConstruccionesTab from "./ConstruccionesTab";
import ResumenFinalTab from "./ResumenFinalTab";



const API = process.env.REACT_APP_API_URL;

const LegalDetail = ({ id, onBack }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    propietario: "", direccion: "", area_m2: "",
    fecha_cert: "", numero_escritura: "", abogado: "", poseedor: "",
  });

  const [files, setFiles] = useState([]);
  const [fileDesc, setFileDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileObj, setFileObj] = useState(null);


  // toggle “No la conozco”: por defecto, usar cálculo si el doc NO tiene área
  const [mostrarFactores, setMostrarFactores] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/legal/${id}`, { headers });
      setDoc(data);
      setForm({
        propietario: data.propietario || "",
        direccion: data.direccion || "",
        area_m2: data.area_m2 ?? "",
        fecha_cert: data.fecha_cert ? data.fecha_cert.slice(0,10) : "",
        numero_escritura: data.numero_escritura || "",
        abogado: data.abogado || "",
        poseedor: data.poseedor || "",
      });
      setFiles(data.archivos || []);
      setMostrarFactores(false);
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async () => {
    try {
      setMsg(null); setSaving(true);
      const payload = {
        propietario: form.propietario || null,
        direccion: form.direccion || null,
        area_m2: form.area_m2 !== "" ? Number(form.area_m2) : null,
      };
      if (doc.tipo === "certificacion") payload.fecha_cert = form.fecha_cert || null;
      if (doc.tipo === "escritura") {
        payload.numero_escritura = form.numero_escritura || null;
        payload.abogado = form.abogado || null;
        payload.poseedor = form.poseedor || null;
      }
      await axios.patch(`${API}/api/legal/${id}`, payload, { headers });
      setMsg({ type: "success", text: "Cambios guardados" });
      load();
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const subirArchivo = async (e) => {
    e.preventDefault();
    if (!fileObj) return setMsg({ type: "warning", text: "Selecciona un archivo" });
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", fileObj);
      if (fileDesc) fd.append("descripcion", fileDesc);
      const { data } = await axios.post(`${API}/api/legal/${id}/archivos`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setFiles((f) => [data, ...f]);
      setFileObj(null); setFileDesc("");
      setMsg({ type: "success", text: "Archivo subido" });
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    } finally {
      setUploading(false);
    }
  };

  const borrarArchivo = async (fileId) => {
    if (!window.confirm("¿Eliminar archivo?")) return;
    try {
      await axios.delete(`${API}/api/legal/archivos/${fileId}`, { headers });
      setFiles((f) => f.filter((x) => x.id !== fileId));
    } catch (err) {
      setMsg({ type: "danger", text: err?.response?.data?.message || err.message });
    }
  };



  if (loading) return <div className="text-muted">Cargando...</div>;
  if (!doc) return <div className="text-danger">No se encontró el documento</div>;

  return (
    <div className="d-grid gap-3">
      {msg && <div className={`alert alert-${msg.type} mb-0`}>{msg.text}</div>}

      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Documento #{doc.numero_interno} · {doc.tipo}</h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>← Volver</button>
      </div>

      {/* Datos generales */}
      <div className="card">
        <div className="card-header">Datos generales</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Propietario</label>
              <input className="form-control" value={form.propietario}
                     onChange={(e)=>setForm(s=>({...s,propietario:e.target.value}))}/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Dirección</label>
              <input className="form-control" value={form.direccion}
                     onChange={(e)=>setForm(s=>({...s,direccion:e.target.value}))}/>
            </div>

              <div className="col-md-3">
                <label className="form-label">Área (m²)</label>
                <input className="form-control" type="number" step="0.01" value={form.area_m2}
                       onChange={(e)=>setForm(s=>({...s,area_m2:e.target.value}))}/>
              </div>

              

            {doc.tipo === "certificacion" && (
              <div className="col-md-3">
                <label className="form-label">Fecha cert.</label>
                <input className="form-control" type="date" value={form.fecha_cert}
                       onChange={(e)=>setForm(s=>({...s,fecha_cert:e.target.value}))}/>
              </div>
            )}

            {doc.tipo === "escritura" && (
              <>
                <div className="col-md-3">
                  <label className="form-label"># Escritura</label>
                  <input className="form-control" value={form.numero_escritura}
                         onChange={(e)=>setForm(s=>({...s,numero_escritura:e.target.value}))}/>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Abogado</label>
                  <input className="form-control" value={form.abogado}
                         onChange={(e)=>setForm(s=>({...s,abogado:e.target.value}))}/>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Poseedor</label>
                  <input className="form-control" value={form.poseedor}
                         onChange={(e)=>setForm(s=>({...s,poseedor:e.target.value}))}/>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <span className="align-self-center text-muted">
              Estado: <span className={`badge ${doc.estado==="activo"?"bg-success":"bg-danger"}`}>{doc.estado}</span>
            </span>
          </div>
        </div>
      </div>

      

      {/* Archivos */}
      <div className="card">
        <div className="card-header">Archivos</div>
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={subirArchivo}>
            <div className="col-md-5">
              <label className="form-label">Archivo (PDF/JPG/PNG)</label>
              <input className="form-control" type="file"
                     accept="application/pdf,image/jpeg,image/png"
                     onChange={(e) => setFileObj(e.target.files?.[0] || null)} />
            </div>
            <div className="col-md-5">
              <label className="form-label">Descripción</label>
              <input className="form-control" value={fileDesc}
                     onChange={(e)=>setFileDesc(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-primary w-100" disabled={uploading}>
                {uploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          </form>

          <div className="table-responsive mt-3">
            <table className="table table-sm table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Archivo</th><th>Tipo</th><th>Descripción</th><th>Fecha</th><th></th>
                </tr>
              </thead>
              <tbody>
                {files.length===0 ? (
                  <tr><td colSpan={6} className="text-center text-muted">Sin archivos</td></tr>
                ) : files.map(f=>(
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td><a href={f.url} target="_blank" rel="noreferrer">{f.url?.split("/").pop()}</a></td>
                    <td>{f.tipo_mime}</td>
                    <td>{f.descripcion || "-"}</td>
                    <td>{new Date(f.creado_en).toLocaleString()}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>borrarArchivo(f.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ReferencialesTab idDocumento={id} headers={headers} setMsg={setMsg} />
      {/* Construcciones */}
      <ConstruccionesTab idDocumento={id} setMsg={setMsg} />
      
      <div className="col-md-3 d-flex align-items-center gap-2">
                <input
                  id="mostrarFactores"
                  className="form-check-input"
                  type="checkbox"
                  checked={mostrarFactores}
                  onChange={(e)=>setMostrarFactores(e.target.checked)}
                />
                <label htmlFor="mostrarFactores" className="form-check-label">
                  Calcular factores de ajuste
                </label>
              </div>
      {mostrarFactores && <TerrenoTab idDocumento={id} />}
      {/* Resumen Final */}
      <ResumenFinalTab idDocumento={id} setMsg={setMsg} />
    </div>
    
  );
};

export default LegalDetail;
