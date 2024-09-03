window.addEventListener('load', async () => {
    const lectorCodigo = new ZXing.BrowserMultiFormatReader();
    const elementoVistaPrevia = document.getElementById('vista-previa');
    const elementoResultado = document.getElementById('resultado');
    const selectDispositivos = document.getElementById('dispositivos-entrada-video');
    const listaCodigos = document.getElementById('lista-codigos');
    const codigosEscaneados = []; // Array para almacenar los códigos escaneados
    const delayMs = 1300; // 1.3 segundos de delay
    let escaneoActivo = true; // Bandera para controlar el estado del escaneo
    let ultimoCodigoEscaneado = ''; // Variable para almacenar el último código escaneado

    // Variables separadas para los datos
    let fechaGuardada = '';
    let horaGuardada = '';
    let unidadGuardada = '';
    let legajoGuardado = '';
    let sedeGuardada = '';

    function agregarCodigoEscaneado(codigo) {
        ultimoCodigoEscaneado = codigo;
        codigosEscaneados.push(codigo);
        const li = document.createElement('li');
        li.textContent = codigo;
        listaCodigos.appendChild(li);
        elementoResultado.textContent = `Último código escaneado: ${codigo}`;
    }

    async function iniciarEscaneo(deviceId) {
        lectorCodigo.reset();
        lectorCodigo.decodeFromVideoDevice(deviceId, 'vista-previa', (resultado, error) => {
            if (resultado && escaneoActivo) {
                escaneoActivo = false; // Desactivar escaneo adicional
                agregarCodigoEscaneado(resultado.text);

                // Reiniciar el escaneo después del delay
                setTimeout(() => {
                    escaneoActivo = true; // Reactivar el escaneo
                }, delayMs);
            }
            if (error && !(error instanceof ZXing.NotFoundException)) {
                console.error('Error de decodificación:', error);
            }
        });
    }

    try {
        const dispositivos = await navigator.mediaDevices.enumerateDevices();
        const dispositivosEntradaVideo = dispositivos.filter(dispositivo => dispositivo.kind === 'videoinput');

        if (dispositivosEntradaVideo.length === 0) {
            throw new Error('No se encontraron dispositivos de entrada de video.');
        }

        dispositivosEntradaVideo.forEach((dispositivo, indice) => {
            const option = document.createElement('option');
            option.value = dispositivo.deviceId;
            option.text = dispositivo.label || `Cámara ${indice + 1}`;
            selectDispositivos.appendChild(option);
        });

        const camaraFrontal = dispositivosEntradaVideo.find(dispositivo => dispositivo.label.toLowerCase().includes('front'));
        if (camaraFrontal) {
            iniciarEscaneo(camaraFrontal.deviceId);
            selectDispositivos.value = camaraFrontal.deviceId;
        } else {
            if (dispositivosEntradaVideo.length > 0) {
                iniciarEscaneo(dispositivosEntradaVideo[0].deviceId);
                selectDispositivos.value = dispositivosEntradaVideo[0].deviceId;
            }
        }

        selectDispositivos.addEventListener('change', (event) => {
            const deviceId = event.target.value;
            iniciarEscaneo(deviceId);
        });

    } catch (error) {
        console.error('Error al enumerar dispositivos:', error);
        elementoResultado.textContent = 'Error al enumerar dispositivos.';
    }

    // Formatear fecha mientras el usuario escribe
    const fechaInput = document.getElementById('fecha');
    fechaInput.addEventListener('input', () => {
        let input = fechaInput.value;

        // Eliminar cualquier carácter que no sea un dígito
        input = input.replace(/\D/g, '');

        // Insertar guiones en las posiciones correctas
        if (input.length > 2 && input.length <= 4) {
            input = `${input.slice(0, 2)}-${input.slice(2)}`;
        } else if (input.length > 4) {
            input = `${input.slice(0, 2)}-${input.slice(2, 4)}-${input.slice(4)}`;
        }

        fechaInput.value = input;
    });

    // Formatear hora mientras el usuario escribe
    const horaInput = document.getElementById('hora');
    horaInput.addEventListener('input', () => {
        let input = horaInput.value;

        // Eliminar cualquier carácter que no sea un dígito
        input = input.replace(/\D/g, '');

        // Insertar dos puntos en la posición correcta
        if (input.length > 2) {
            input = `${input.slice(0, 2)}:${input.slice(2)}`;
        }

        horaInput.value = input;
    });

    // Manejo del envío del formulario
    const formDatos = document.getElementById('form-datos');
    formDatos.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el envío del formulario

        // Obtener los valores de los campos
        fechaGuardada = document.getElementById('fecha').value;
        horaGuardada = document.getElementById('hora').value;
        unidadGuardada = document.getElementById('unidad').value;
        legajoGuardado = document.getElementById('legajo').value;
        sedeGuardada = document.getElementById('sede').value;

        // Validar el número de legajo y la sede
        if (!legajoGuardado.match(/^\d+$/)) {
            alert('El número de legajo debe ser numérico.');
            return;
        }

        if (!['AEP', 'EZE', 'TMAD'].includes(sedeGuardada)) {
            alert('La sede seleccionada es inválida.');
            return;
        }

        // Mostrar los datos en el elemento datos-resultado
        const datosResultado = document.getElementById('datos-resultado');
        datosResultado.textContent = `Código: ${ultimoCodigoEscaneado}, Fecha: ${fechaGuardada}, Hora: ${horaGuardada}, Unidad: ${unidadGuardada}, Legajo: ${legajoGuardado}, Sede: ${sedeGuardada}`;

        // Limpiar los campos de entrada
        document.getElementById('fecha').value = '';
        document.getElementById('hora').value = '';
        document.getElementById('unidad').value = '';
        document.getElementById('legajo').value = '';
        document.getElementById('sede').value = '';
    });
});
