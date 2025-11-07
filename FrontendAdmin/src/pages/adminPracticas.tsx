import React, { useEffect } from 'react';

import Toast from '../components/toast';
import Loader from '../components/loader';


interface practicasProps {
  tipo_practica: string;
  nombre_contacto: string;
  cargo_contacto: string;
  correo_contacto: string;
  telefono_contacto: string;
  nombre_empresa: string;
  sitio_web_empresa: string;
  unidad_empresa: string;
  fechas_practica: string;
  modalidad: string;
  sede_practica: string;
  regimen_trabajo: string;
  labores: string;
  beneficios: string;
  requisitos_especiales: string;
}


export default function AdminPracticas() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const openModal = () => { setModalOpen(true); }
  const closeModal = () => { setModalOpen(false); }
  const [form, setForm] = React.useState(false);
  const [toastState, setToastState] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastStatus, setToastStatus] = React.useState<'success' | 'error'>('success');
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<practicasProps>({
    tipo_practica: '',
    nombre_contacto: '',
    cargo_contacto: '',
    correo_contacto: '',
    telefono_contacto: '',
    nombre_empresa: '',
    sitio_web_empresa: '',
    unidad_empresa: '',
    fechas_practica: '',
    modalidad: '',
    sede_practica: '',
    regimen_trabajo: '',
    labores: '',
    beneficios: '',
    requisitos_especiales: '',
  });
  const makeToast = (message: string, status: 'success' | 'error') => {
    setToastMessage(message);
    setToastStatus(status);
    setToastState(true);
    setTimeout(() => {
      setToastState(false);
      setToastMessage('');
    }, 3000);
  }

  const [fileContent, setFileContent] = React.useState<File | FileReader | null>(null);
  const [fileUpload, setFileUploaded] = React.useState(false);
  const handleAddPractica = () => {
    openModal();
  }
  const changeOption = () => {
    setForm(!form);
    resetDataUpload();
  }
  const resetDataUpload = () => {
    setFileUploaded(false);
    setFileContent(null);
    setFormData({
      tipo_practica: '',
      nombre_contacto: '',
      cargo_contacto: '',
      correo_contacto: '',
      telefono_contacto: '',
      nombre_empresa: '',
      sitio_web_empresa: '',
      unidad_empresa: '',
      fechas_practica: '',
      modalidad: '',
      sede_practica: '',
      regimen_trabajo: '',
      labores: '',
      beneficios: '',
      requisitos_especiales: '',
    });

  }



  const handleCloseModal = () => {
    closeModal();
    setForm(false);
    resetDataUpload();
    
  }
  // fucnion que verifica que el form este vacio
  const isFormEmpty = () => {
    return Object.values(formData).every((value) => value === '') && fileContent === null;
  }

  const  onSubmit = async () => {
    if (!isFormEmpty() || fileContent) { 
      if (form) {
        // si alguno de los campos del formulario que son requeridos esta vacio, mostrar un toast de error
        for (const [key, value] of Object.entries(formData)) {
          if (value === '' && key !== 'beneficios' && key !== 'requisitos_especiales') {
            makeToast('Por favor complete todos los campos requeridos del formulario.', 'error');
            return;
          }
        }
        // otras berificaciones pueden ir aqui opcionamente, 
        
        // enviar data del formulario
        setLoading(true);
        const response = await fetch('/api/admin/administrar/practicas/form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          makeToast('Práctica agregada exitosamente.', 'success');
          setLoading(false);
          resetDataUpload();
          return;
        } else {
          makeToast('Error al agregar práctica.', 'error');
        } 
      }else {
        // Aquí iría la lógica para procesar el archivo CSV subido
        console.log("Processing uploaded file:", fileContent);
        return;
      }
    }else{
      makeToast('Por favor complete el formulario o cargue un archivo antes de enviar.', 'error');
    }
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }
  const onAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setFileUploaded(true);
      reader.onload = () => {
        setFileContent(reader);
      };
      reader.readAsText(file);
      setFileContent(file)
    }
  }


  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileUploaded(true);
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader);
      };
      reader.readAsText(file);
      setFileContent(file);
    }
  }

  const handleDownloadTemplate = () => {
    console.log("Downloading CSV template...");
  }



  return (
    <main className='p-6 w-full min-h-screen '>
      {loading && <Loader frase={"Enviando..."} />}
      {toastState && <Toast message={toastMessage} status={toastStatus} />}
      <div className='bg-white shadow-md rounded-lg h-lvh flex flex-col '>
        <h1 className='text-2xl font-bold mb-4 text-center mt-40'>Página de Administración de Prácticas</h1>
        <div className="p-20 grid grid-cols-2 gap-4 justify-center items-center space-x-8">
          <button className='bg-slate-500 text-white px-4 py-2 rounded-md  h-30 text-2xl' onClick={handleAddPractica}>Agregar Práctica</button>
          <button className='bg-slate-500 text-white px-4 py-2 rounded-md h-30 text-2xl'>Administrar Prácticas existentes</button>
        </div>
        {modalOpen ? (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-3/4 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Agregar Nueva Práctica</h2>
              <div className="mb-4">
                {modalOpen && !form ? 
                <FileUploadForm
                 onChange={onAddFile}
                 onDrop={onDrop}
                 fileUpload={fileUpload}
                /> : 
                <FormPractica onChange={onChange} {...formData} />
                }
                {modalOpen && !form ?
                  <div className="flex flex-col mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                    <div className="flex flex-row items-center mb-4 gap-2">
                      <p> Haga click en el botón a continuacion para descargar el formato de archivo CSV pedido:</p>
                      <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleDownloadTemplate}>Descargar CSV</button>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <p> Si desea Agregar una nueva práctica manualmente, haga clic en el botón a continuación:</p>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={changeOption}>Agregar Práctica Manualmente</button>
                    </div>
                  </div>
                : null}
                {modalOpen && form ? 
                <div className="flex flex-row items-center mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                    <p> Si desea Agregar practicas subiando un archivo CSV, haga clic en el botón a continuación:</p>
                    <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={changeOption}>Agregar Archivo Prácticas</button>
                </div>:null}
              <div className="flex justify-end space-x-4 pt-5">
                <button className="bg-red-400 text-white px-4 py-2 rounded-md" onClick={handleCloseModal}>Cancelar</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={onSubmit}>Guardar Práctica</button> 
              </div>
              </div>
            </div>
          </div>
        ) : null}
        
      </div>
    </main>
  );
}



function FileUploadForm({ onChange, onDrop,fileUpload }: { onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, onDrop?: (e: React.DragEvent<HTMLDivElement>) => void, fileUpload: boolean }) {
  

  const boxStyles = {
    uploaded : "flex flex-col items-center justify-center border-2 border-dashed border-green-500 rounded-xl p-6 bg-green-50 hover:bg-green-100 cursor-pointer",
    notUploaded : "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer"
  }
  const [currentBoxStyle, setCurrentBoxStyle] = React.useState(boxStyles.notUploaded);

  useEffect(() => {
    if (fileUpload) {
      setCurrentBoxStyle(boxStyles.uploaded);
    } else {
      setCurrentBoxStyle(boxStyles.notUploaded);
    }
  }, [fileUpload]);


  return ( 
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Importar CSV (arrastrar o agregar)</label>
        <div onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className={currentBoxStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 014-4h2a4 4 0 014 4v4M12 12v8m0-8l-3 3m3-3 3 3" />
          </svg>
          <p className="text-sm text-gray-600">
            {fileUpload ? 'Archivo CSV cargado' : 'Arrastra un CSV aquí o'}
          </p>
          <label className="mt-2 inline-block bg-white border border-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-100">
            <input type="file" accept=".csv,text/csv" onChange={onChange} className="hidden" />
            Seleccionar archivo
          </label>
        </div>
      </div>
    </>
  );
}



function FormPractica(props: practicasProps & { onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void }) {
  const { onChange } = props;
  return (
  <form className='grid grid-cols-4 gap-10'>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Tipo de práctica</label>
      <select
        onChange={onChange}
        name="tipo_practica"
        value={props.tipo_practica}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        aria-required="true"
      >
        <option value="">Seleccione...</option>
        <option value="Inicial">Practica Inicial</option>
        <option value="Profesional">Práctica profesional</option>
      </select>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Nombre del contacto</label>
      <input
        onChange={onChange}
        name="nombre_contacto"
        type="text"
        value={props.nombre_contacto}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Cargo del contacto</label>
      <input
        onChange={onChange}
        name="cargo_contacto"
        type="text"
        value={props.cargo_contacto}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Correo del contacto</label>
      <input
        onChange={onChange}
        name="correo_contacto"
        type="email"
        value={props.correo_contacto}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Teléfono del contacto</label>
      <input
        onChange={onChange}
        name="telefono_contacto"
        type="tel"
        value={props.telefono_contacto}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Nombre de la empresa</label>
      <input
        onChange={onChange}
        name="nombre_empresa"
        type="text"
        value={props.nombre_empresa}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Sitio web de la empresa</label>
      <input
        onChange={onChange}
        name="sitio_web_empresa"
        type="url"
        value={props.sitio_web_empresa}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Unidad de la empresa</label>
      <input
        onChange={onChange}
        name="unidad_empresa"
        type="text"
        value={props.unidad_empresa}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Fechas de la práctica</label>
      <input
        onChange={onChange}
        name="fechas_practica"
        type="text"
        placeholder="Ej. Enero 2025 - Agosto 2025"
        value={props.fechas_practica}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Modalidad</label>
      <select
        onChange={onChange}
        name="modalidad"
        value={props.modalidad}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
        aria-required="true"
      >
        <option value="">Seleccione...</option>
        <option value="presencial">Presencial</option>
        <option value="remoto">Remoto</option>
        <option value="hibrido">Híbrido</option>
      </select>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Sede o Ciudad</label>
      <input
        onChange={onChange}
        name="sede_practica"
        type="text"
        value={props.sede_practica}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Régimen de trabajo</label>
      <select
        onChange={onChange}
        name="regimen_trabajo"
        value={props.regimen_trabajo}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
        aria-required="true"
      >
        <option value="">Seleccione...</option>
        <option value="tiempo_completo">Tiempo completo</option>
        <option value="medio_tiempo">Medio tiempo</option>
        <option value="por_horas">Por horas</option>
      </select>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Labores</label>
      <textarea
        onChange={onChange}
        name="labores"
        value={props.labores}
        required
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
        rows={3}
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Beneficios (opcional)</label>
      <textarea
        onChange={onChange}
        name="beneficios"
        value={props.beneficios}
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
        rows={3}
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Requisitos especiales (opcional)</label>
      <textarea
        onChange={onChange}
        name="requisitos_especiales"
        value={props.requisitos_especiales}
        className="rounded-xl border border-gray-300 p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
        rows={3}
      />
    </div>
  </form>
  );

}