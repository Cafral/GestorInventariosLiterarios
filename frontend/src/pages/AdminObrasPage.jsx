import { useState, useEffect } from 'react'
import { obrasApi, carrerasApi, autoresApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import '../estilos/AdminObrasPage.css'

const OBRA_INIT = {
  titulo: '', genero: '', isbn13: '', plataforma: 'Físico',
  precioAdquisicion: '', carreraId: '', autorId: '',
  editorial: '', anio: new Date().getFullYear(), imagen_url: ''
}
const AUTOR_INIT = { nombre: '', email: '', biografia: '' }

export default function AdminObrasPage() {
  const { usuario } = useAuth()

  const [obras, setObras] = useState([])
  const [carreras, setCarreras] = useState([])
  const [autores, setAutores] = useState([])
  const [form, setForm] = useState(OBRA_INIT)
  const [autorForm, setAutorForm] = useState(AUTOR_INIT)

  const [msg, setMsg] = useState('')
  const [msgAutor, setMsgAutor] = useState('')
  const [errores, setErrores] = useState({})
  const [tabActiva, setTabActiva] = useState('obras')
  const [previewImg, setPreviewImg] = useState(null)

  const cargar = () => {
    obrasApi.listar().then(setObras).catch(() => { })
    carrerasApi.listar().then(setCarreras).catch(() => { })
    autoresApi.listar().then(setAutores).catch(() => { })
  }
  useEffect(() => { cargar() }, [])

  // ── Verificaciones de duplicados
  const chequearISBN = async (valor) => {
    const yaExiste = await verificarDuplicado('/obras/existe?isbn13=', valor)
    if (yaExiste) {
      setErrores(er => ({ ...er, isbn13: 'Este ISBN-13 ya está registrado en el sistema' }))
    }
  }

  const chequearTitulo = async (valor) => {
    const yaExiste = await verificarDuplicado('/obras/existe?titulo=', valor)
    if (yaExiste) {
      setErrores(er => ({ ...er, titulo: 'Ya existe una obra con este título' }))
    }
  }

  const chequearNombreAutor = async (valor) => {
    const yaExiste = await verificarDuplicado('/autores/existe?nombre=', valor)
    if (yaExiste) {
      setErrores(er => ({ ...er, nombre: 'Ya existe un autor con este nombre' }))
    }
  }

  // Imagen a base64
  const handleImagen = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrores(er => ({ ...er, imagen: 'La imagen no debe superar 2MB' }))
      return
    }
    const permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!permitidos.includes(file.type)) {
      setErrores(er => ({ ...er, imagen: 'Solo se permiten JPG, PNG, GIF o WEBP' }))
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(f => ({ ...f, imagen_url: ev.target.result }))
      setPreviewImg(ev.target.result)
      setErrores(er => ({ ...er, imagen: '' }))
    }
    reader.readAsDataURL(file)
  }

  const quitarImagen = () => {
    setPreviewImg(null)
    setForm(f => ({ ...f, imagen_url: '' }))
    setErrores(er => ({ ...er, imagen: '' }))
  }

  // Validaciones obra
  const validarObra = () => {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (!form.isbn13.trim()) e.isbn13 = 'El ISBN-13 es obligatorio'
    if (!form.editorial.trim()) e.editorial = 'La editorial es obligatoria'
    if (!form.carreraId) e.carreraId = 'Selecciona una carrera'
    if (!form.autorId) e.autorId = 'Selecciona un autor'
    if (!form.precioAdquisicion || parseFloat(form.precioAdquisicion) <= 0)
      e.precio = 'El precio debe ser mayor a 0'
    return e
  }

  // ── Crear obra
  const handleCrear = async (e) => {
    e.preventDefault()
    setMsg('')
    const ev = validarObra()
    if (Object.keys(ev).length) { setErrores(ev); return }
    setErrores({})
    try {
      const res = await obrasApi.crear({
        ...form,
        precioAdquisicion: parseFloat(form.precioAdquisicion),
        carreraId: parseInt(form.carreraId),
        autorId: parseInt(form.autorId),
        anio: parseInt(form.anio)
      })
      const resultado = res.resultado
      if (String(resultado).startsWith('ERROR')) {
        setMsg('ERROR: ' + resultado)
      } else {
        setMsg('Obra creada con ID: ' + resultado)
        setForm(OBRA_INIT)
        setPreviewImg(null)
        cargar()
      }
    } catch (err) {
      setMsg('ERROR: ' + err.message)
    }
  }

  // ── Estado y eliminar obra
  const handleEstado = async (id, estado) => {
    try {
      await obrasApi.cambiarEstado(id, {
        estado, responsable: usuario?.nombre || 'admin', notas: ''
      })
      cargar()
    } catch (err) { alert(err.message) }
  }

  const handleEliminarObra = async (id) => {
    if (!confirm('¿Eliminar esta obra permanentemente?')) return
    await obrasApi.eliminar(id)
    cargar()
  }

  // ── Crear autor
  const validarAutor = () => {
    const e = {}
    if (!autorForm.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    return e
  }

  const handleCrearAutor = async (e) => {
    e.preventDefault()
    setMsgAutor('')
    const ev = validarAutor()
    if (Object.keys(ev).length) { setErrores(ev); return }
    setErrores({})
    try {
      const res = await autoresApi.crear(autorForm)
      if (String(res.resultado).startsWith('ERROR')) {
        setMsgAutor('ERROR: ' + res.resultado)
      } else {
        setMsgAutor('Autor registrado correctamente')
        setAutorForm(AUTOR_INIT)
        autoresApi.listar().then(setAutores)
      }
    } catch (err) {
      setMsgAutor('ERROR: ' + err.message)
    }
  }

  // ── Eliminar autor
  const handleEliminarAutor = async (id, nombre) => {
    if (!confirm(`¿Eliminar al autor "${nombre}"?\nSi tiene obras asociadas no se podrá eliminar.`)) return
    try {
      await autoresApi.eliminar(id)
      setMsgAutor('Autor eliminado correctamente')
      autoresApi.listar().then(setAutores)
    } catch (err) {
      setMsgAutor('ERROR: ' + err.message)
    }
  }

  const cambiar = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrores(er => ({ ...er, [e.target.name]: '' }))
  }
  const cambiarAutor = (e) => {
    setAutorForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrores(er => ({ ...er, [e.target.name]: '' }))
  }

  return (
    <div className="admin-container">
      <h2 className="admin-main-title">Panel de Administración</h2>

      <div className="admin-tabs">
        <button
          className={`admin-btn-submit${tabActiva === 'obras' ? '' : ' admin-btn-secondary'}`}
          onClick={() => setTabActiva('obras')}>
          Obras
        </button>
        <button
          className={`admin-btn-submit${tabActiva === 'autores' ? '' : ' admin-btn-secondary'}`}
          onClick={() => setTabActiva('autores')}>
          Autores
        </button>
      </div>

      {/* TAB OBRAS */}
      {tabActiva === 'obras' && (<>
        <h3 className="admin-subtitle">Registrar Nueva Obra</h3>
        <form onSubmit={handleCrear} className="admin-form-grid" noValidate>

          <div className="admin-form-group">
            <label className="admin-label">Título *</label>
            <input name="titulo" type="text"
              className={`admin-input${errores.titulo ? ' input-error' : ''}`}
              value={form.titulo} onChange={cambiar}
              onBlur={() => chequearTitulo(form.titulo)} />
            {errores.titulo && <span className="field-error">{errores.titulo}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Género</label>
            <input name="genero" type="text" className="admin-input"
              value={form.genero} onChange={cambiar} />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">ISBN-13 *</label>
            <input name="isbn13" type="text"
              className={`admin-input${errores.isbn13 ? ' input-error' : ''}`}
              value={form.isbn13} onChange={cambiar}
              onBlur={() => chequearISBN(form.isbn13)} />
            {errores.isbn13 && <span className="field-error">{errores.isbn13}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Plataforma</label>
            <select name="plataforma" className="admin-input"
              value={form.plataforma} onChange={cambiar}>
              <option value="Físico">Físico</option>
              <option value="Digital">Digital</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Costo de Adquisición ($) *</label>
            <input name="precioAdquisicion" type="number" step="0.01" min="0.01"
              className={`admin-input${errores.precio ? ' input-error' : ''}`}
              value={form.precioAdquisicion} onChange={cambiar} />
            {errores.precio && <span className="field-error">{errores.precio}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Editorial *</label>
            <input name="editorial" type="text"
              className={`admin-input${errores.editorial ? ' input-error' : ''}`}
              value={form.editorial} onChange={cambiar} />
            {errores.editorial && <span className="field-error">{errores.editorial}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Año</label>
            <input name="anio" type="number" min="1900" max="2027"
              className="admin-input" value={form.anio} onChange={cambiar} />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Carrera *</label>
            <select name="carreraId"
              className={`admin-input${errores.carreraId ? ' input-error' : ''}`}
              value={form.carreraId} onChange={cambiar}>
              <option value="">Selecciona una carrera</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {errores.carreraId && <span className="field-error">{errores.carreraId}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Autor *</label>
            <select name="autorId"
              className={`admin-input${errores.autorId ? ' input-error' : ''}`}
              value={form.autorId} onChange={cambiar}>
              <option value="">Selecciona un autor</option>
              {autores.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            {errores.autorId && <span className="field-error">{errores.autorId}</span>}
            <small className="admin-help-text">
              ¿No aparece? Agrégalo en la pestaña "Autores".
            </small>
          </div>

          <div className="admin-form-group full-width">
            <label className="admin-label">Imagen de portada (JPG, PNG, WEBP — máx. 2MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              className="admin-input" onChange={handleImagen} />
            {errores.imagen && <span className="field-error">{errores.imagen}</span>}
            {previewImg && (
              <div className="admin-image-preview">
                <img src={previewImg} alt="Vista previa" className="admin-preview-img" />
                <button type="button" onClick={quitarImagen} className="admin-btn-remove-img">
                  X Quitar imagen
                </button>
              </div>
            )}
          </div>

          <div className="admin-form-actions full-width">
            <button className="admin-btn-submit" type="submit">+ Crear Nueva Obra</button>
            {msg && (
              <span className={msg.startsWith('ERROR') ? 'admin-msg-error' : 'admin-msg-success'}>
                {msg}
              </span>
            )}
          </div>
        </form>

        <h3 className="admin-subtitle">Obras registradas ({obras.length})</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-header-row">
                {['ID', 'Título', 'ISBN', 'PVP', 'Stock', 'Estado', 'Acciones'].map(h =>
                  <th key={h} className="admin-th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {obras.map(o => (
                <tr key={o.id} className="admin-table-row">
                  <td className="admin-td">{o.id}</td>
                  <td className="admin-td admin-td-bold">{o.titulo}</td>
                  <td className="admin-td">{o.isbn13}</td>
                  <td className="admin-td admin-text-red">${Number(o.pvp).toFixed(2)}</td>
                  <td className="admin-td">{o.stock_actual}</td>
                  <td className="admin-td">
                    <span className="admin-status-badge">{o.estado_actual ?? '—'}</span>
                  </td>
                  <td className="admin-td admin-actions-cell">
                    <select className="admin-select-status"
                      onChange={e => handleEstado(o.id, e.target.value)}
                      defaultValue="">
                      <option value="" disabled>Estado</option>
                      {['BORRADOR', 'ENTREGADO', 'PUBLICADO', 'VENDIDO'].map(s =>
                        <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="admin-btn-delete"
                      onClick={() => handleEliminarObra(o.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* TAB AUTORES */}
      {tabActiva === 'autores' && (<>
        <h3 className="admin-subtitle">Registrar Nuevo Autor</h3>
        <form onSubmit={handleCrearAutor} className="admin-form-grid" noValidate>

          <div className="admin-form-group">
            <label className="admin-label">Nombre Completo *</label>
            <input name="nombre" type="text"
              className={`admin-input${errores.nombre ? ' input-error' : ''}`}
              value={autorForm.nombre} onChange={cambiarAutor}
              onBlur={() => chequearNombreAutor(autorForm.nombre)} />
            {errores.nombre && <span className="field-error">{errores.nombre}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input name="email" type="email" className="admin-input"
              value={autorForm.email} onChange={cambiarAutor} />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Biografía</label>
            <textarea name="biografia" rows={3} className="admin-input admin-textarea"
              value={autorForm.biografia} onChange={cambiarAutor} />
          </div>

          <div className="admin-form-actions full-width">
            <button className="admin-btn-submit" type="submit">+ Agregar Autor</button>
            {msgAutor && (
              <span className={msgAutor.startsWith('ERROR') ? 'admin-msg-error' : 'admin-msg-success'}>
                {msgAutor}
              </span>
            )}
          </div>
        </form>

        <h3 className="admin-subtitle">Autores registrados ({autores.length})</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-header-row">
                {['ID', 'Nombre', 'Email', 'Biografía', 'Acciones'].map(h =>
                  <th key={h} className="admin-th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {autores.map(a => (
                <tr key={a.id} className="admin-table-row">
                  <td className="admin-td">{a.id}</td>
                  <td className="admin-td admin-td-bold">{a.nombre}</td>
                  <td className="admin-td">{a.email || '—'}</td>
                  <td className="admin-td">
                    {a.biografia ? a.biografia.substring(0, 60) + '...' : '—'}
                  </td>
                  <td className="admin-td">
                    <button
                      className="admin-btn-delete"
                      onClick={() => handleEliminarAutor(a.id, a.nombre)}
                      title="Eliminar autor">
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  )
}