const listaDeProductos = document.getElementById ("contenedor")
const modalCarrito = document.getElementById ("carrito")
const inputBusqueda = document.getElementById ("busqueda")
const categorias = document.querySelectorAll (".dropdown-item")
const btnTodosProductos = document.getElementById ("todos-los-productos")
const totalProductos = document.getElementById ("total-productos")
const totalCarrito = document.getElementById ("total-carrito")
const btnFinalizar = document.getElementById ("finalizar-compra")
const btnEnviarPedido = document.getElementById ("btn-enviar-pedido")
const contenedorFormulario = document.getElementById ("formulario")


let arrayProductos = [];
let carritoDeCompras = JSON.parse(localStorage.getItem('carrito')) || [];
let searchTimeOut = null;

const productoNoEncontrado = `
<div class='mt-5 row  justify-content-center '>
    <div class="col-8 text-center px-2 py-4 border border-info  rounded">
        <span class="form-text text-center">No encontramos productos con ese nombre!</span>
    </div>
</div>
`;

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

const generarCarta = (producto) => {
    let card = document.createElement ("div");
    let img = document.createElement ("img");
    let div = document.createElement ("div");
    let titulo = document.createElement ("h5");
    let precio = document.createElement ("p");
    let boton = document.createElement ("a");
    card.classList= "card m-2" ;
    card.style= "width: 18rem;";
    img.classList = "card-img-top";
    img.src = producto.img;
    div.classList = "card-body";
    titulo.classList = "card-title";
    titulo.innerText = producto.nombre
    precio.classList = "card-text";
    precio.innerText = "precio: $ " + producto.precio
    boton.classList = "btn btn-success";
    boton.innerText = "comprar";
    boton.id = producto.id;

    div.append (titulo);
    div.append (precio);
    div.append (boton);
    card.append (img);
    card.append (div);

    boton.addEventListener ("click", agregarProducto);

    return card;
    
}

const agregarProducto = (event) => {
    event.preventDefault();
    console.log(event.target.id);

    let seleccionado = arrayProductos.find ((item)=> item.id == event.target.id)
    console.log(seleccionado);
    let existe = carritoDeCompras.find ((item)=>item.id == seleccionado.id)
    if (existe) {
        carritoDeCompras = carritoDeCompras.map ((item)=>{
            if (event.target.id == item.id) {
                item.cantidad ++
            }
            return item
        })
    }else {
        carritoDeCompras.push({...seleccionado, cantidad: 1})
    }
    Toast.fire({
        icon: 'success',
        title: "Agregaste: "+ seleccionado.nombre +" al carrito."
    })

    mostrarProductos (carritoDeCompras,modalCarrito,generarListaCarrito);
    setTotal ()
}

const generarListaCarrito = (producto)=> {
    let fila = document.createElement ("tr");
    let cantidad = document.createElement ("td");
    let nombre = document.createElement ("td");
    let precio = document.createElement ("td");
    let acciones = document.createElement ("td");
    let botonEliminar = document.createElement ("a");
    let botonSumar = document.createElement ("a");
    let botonTacho = document.createElement ("a");
    cantidad.innerText = producto.cantidad;
    nombre.innerText = producto.nombre;
    precio.innerText = "$" + producto.precio;
    botonEliminar.innerHTML = "-";
    botonSumar.innerHTML = "+";
    botonTacho.innerHTML = "<img id='" + producto.id +"' src='./multimedia/trash-can-solid.svg' width='20px'>";
    botonEliminar.classList = "btn btn-danger"
    botonSumar.classList = "btn btn-success"
    botonTacho.style = "margin-left:20px"
    botonEliminar.id = producto.id;
    botonTacho.id = producto.id;
    botonSumar.id = producto.id;
    acciones.append (botonSumar)
    acciones.append (botonEliminar)
    acciones.append (botonTacho)
    fila.append (cantidad);
    fila.append (nombre);
    fila.append (precio);
    fila.append (acciones);

    botonEliminar.addEventListener ("click", eliminarProducto);
    botonSumar.addEventListener ("click", agregarProducto);
    botonTacho.addEventListener ("click", ({target:{id}})=>{
        carritoDeCompras = carritoDeCompras.filter (item => item.id !=id)
        mostrarProductos (carritoDeCompras,modalCarrito,generarListaCarrito);
        setTotal();
    });
    return fila;
}


const eliminarProducto = (event) => {
    event.preventDefault();
    let seleccionado = carritoDeCompras.find (item => item.id == event.target.id)
    if (seleccionado.cantidad > 1) {
        carritoDeCompras = carritoDeCompras.map ((item)=>{
            if (event.target.id == item.id) {
                item.cantidad --
            }
            return item
        })
    } 
    else {
        carritoDeCompras = carritoDeCompras.filter (item => item.id != event.target.id)
    }

    mostrarProductos (carritoDeCompras,modalCarrito,generarListaCarrito);
    setTotal ();
}


const mostrarProductos = (lista, dom, callback = generarCarta) => {
    dom.innerHTML = "";
    for (const producto of lista) {
        dom.append (callback (producto))
    }
    contenedorFormulario.style = 'display: none';
}

const filtrarProductos = (valoresInput) => {
    let productosFiltrados = arrayProductos.filter ((item)=>item.nombre.toUpperCase().includes(valoresInput))
    if (productosFiltrados.length == 0) {
        listaDeProductos.innerHTML = productoNoEncontrado;
    }else{
        mostrarProductos (productosFiltrados, listaDeProductos)
    }
}

const funcionBusqueda = (e) =>{
    let busqueda = e.target.value.toUpperCase();
    if (searchTimeOut) {
        clearTimeout(searchTimeOut)
        searchTimeOut= null;
    }
    if (busqueda.length > 2) {
    searchTimeOut = setTimeout(() => {
                        filtrarProductos (busqueda) 
                        clearTimeout(searchTimeOut)
                    }, 1000);
    } else if(busqueda.length == 0){
        mostrarProductos (arrayProductos,listaDeProductos)
    }
}

const filtrarCategoria = (e)=> {
    let categoria = e.target.id
    let filtrosPorCategoria = arrayProductos.filter((e)=> "categoria-" + e.categoria==categoria)
    mostrarProductos (filtrosPorCategoria,listaDeProductos)
}

const setTotal = () => {
    let totalDeProductos= carritoDeCompras.length;
    let suma = (a,b)=> a + (b.precio * b.cantidad);
    let precioTotal = carritoDeCompras.reduce((total,item)=> suma(total,item), 0);
    localStorage.setItem('carrito', JSON.stringify(carritoDeCompras));
    
    totalCarrito.innerText ='$' + precioTotal
    totalProductos.innerText = totalDeProductos != 0 ? totalDeProductos : '';
    totalProductos.classList = totalDeProductos != 0 ? 'notificacion-canasto' : '';
    btnFinalizar.style=  totalDeProductos != 0 ? 'display: block' : 'display: none';
}

const finalizarCompra = () => {
    listaDeProductos.innerHTML="";
    contenedorFormulario.style = 'display: flex';
}


const validateForm = () => {
    const forms = document.querySelectorAll('.needs-validation')
    const inptNombre = document.getElementById('inputNombre');
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        }else{
            swal.fire({
                icon: "success",
                title: inptNombre.value,
                text: 'Gracias por su compra!',
            }).then((res) => {
                if (res.isConfirmed) {
                    localStorage.clear();
                    window.location.reload();
                }
            })
        }
        form.classList.add('was-validated')
        }, false)
    })
}

const getProductos = () => {
    fetch ("./data.json")
        .then ((promesa)=> promesa.json ())
        .then ((productos)=>{
            console.log(productos);
            arrayProductos = productos
            mostrarProductos (productos,listaDeProductos)
        })
}

window.onload = () => {
    if (carritoDeCompras.length > 0) {
        mostrarProductos (carritoDeCompras,modalCarrito,generarListaCarrito);
        setTotal();
    }
    getProductos();
    inputBusqueda.addEventListener ("input",funcionBusqueda);
    categorias.forEach ((c)=> c.addEventListener("click",filtrarCategoria)),
    btnTodosProductos.addEventListener('click', ()=> mostrarProductos(arrayProductos, listaDeProductos));
    btnFinalizar.addEventListener('click', finalizarCompra);
    btnEnviarPedido.addEventListener('click', validateForm);

}

