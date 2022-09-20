import axios from 'axios';
import Swal from 'sweetalert2';


document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos')

    //limpiar las alertas 
    let alertas = document.querySelector('.alertas');

    if (alertas) {
        limpiarAlertas();
    }

    if (skills) {
        skills.addEventListener('click', agregarSkills);

        // llamar cuando estamos en editar
        skillsSeleccionados();
    }


    const vacantesListado = document.querySelector('.panel-administracion');

    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
})

const skills = new Set();


const agregarSkills = e => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent)
            e.target.classList.remove('activo');
        } else {
            skills.add(e.target.textContent)
            e.target.classList.add('activo');
        }
    }

    //convertir Set a un array para poder usarlo en el DOM 
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    })

    //inyectarlo en el hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas')

    setTimeout(() => {
        while (alertas.children.length != 0) {
            alertas.removeChild(alertas.firstChild)
        }
    }, 2000)
}

//eliminar vacantes
const accionesListado = e => {
    e.preventDefault();

    if (e.target.classList.contains('eliminar')) {
                
        Swal.fire({
            title: '¿Esta seguro de eliminar la vacante?',
            text: "Una vez eliminada no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                //enviar peticion con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                axios.delete(url, { params: {url} })
                    .then( res => {
                        if(res.status === 200){
                            Swal.fire(
                                'Eliminado',
                                res.data,
                                'success'
                            );

                            //Eliminar vacante del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
                        }
                    } )
                    .catch( () => {
                        Swal.fire({
                            type:'error',
                            title:'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    } )

            }
        })
    } else {
        window.location.href = e.target.href;
    }

}