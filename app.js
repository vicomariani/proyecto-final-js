// Clase "molde" para los productos de la aplicación
class Producto {
    constructor(id, nombre, precio, categoria, imagen) {
      this.id = id;
      this.nombre = nombre;
      this.precio = precio;
      this.categoria = categoria;
      this.imagen = imagen;
    }
  }
  
  class BaseDeDatos {
    constructor() {
      this.productos = [];
      this.cargarRegistros();
    }
  
    // Función asincrónica 
    async cargarRegistros() {
      const resultado = await fetch("./json/productos.json");
      this.productos = await resultado.json();
      cargarProductos(this.productos);
    }
  
    // Nos devuelve el catálogo de productos
    traerRegistros() {
      return this.productos;
    }
  
    // Nos devuelve un producto según el ID
    registroPorId(id) {
      return this.productos.find((producto) => producto.id === id);
    }
  
    //Nos devuelve un array con todas las coincidencias que encuentre segun el nombre del producto
    registrosPorNombre(palabra) {
      return this.productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(palabra.toLowerCase())
      );
    }
  
    // Nos devuelve un array con todos los productos que tengan la categoría que le pasamos como parámetro
    registrosPorCategoria(categoria) {
      return this.productos.filter((producto) => producto.categoria == categoria);
    }
  }
  
  class Carrito {
    constructor() {
      // Storage
      const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
      this.carrito = carritoStorage || [];
      this.total = 0; 
      this.cantidadProductos = 0; 
      this.listar();
    }
  
    // Método para saber si el producto ya se encuentra en el carrito
    estaEnCarrito({ id }) {
      return this.carrito.find((producto) => producto.id === id);
    }
  
    // Agregar al carrito
    agregar(producto) {
      const productoEnCarrito = this.estaEnCarrito(producto);
      if (!productoEnCarrito) {
        this.carrito.push({ ...producto, cantidad: 1 });
      } else {
        productoEnCarrito.cantidad++;
      }
      
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      
      this.listar();
    }
  
    // Quitar del carrito
    quitar(id) {
      const indice = this.carrito.findIndex((producto) => producto.id === id);
      if (this.carrito[indice].cantidad > 1) {
        this.carrito[indice].cantidad--;
      } else {
        this.carrito.splice(indice, 1);
      }
      
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      this.listar();
    }
  
    // Vaciar el carrito
    vaciar() {
      this.total = 0;
      this.cantidadProductos = 0;
      this.carrito = [];
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      this.listar();
    }
  
    listar() {
      this.total = 0;
      this.cantidadProductos = 0;
      divCarrito.innerHTML = "";
      
      for (const producto of this.carrito) {
        divCarrito.innerHTML += `
          <div class="productoCarrito">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
          </div>
        `;
        // Actualizamos los totales
        this.total += producto.precio * producto.cantidad;
        this.cantidadProductos += producto.cantidad;
      }
      if (this.cantidadProductos > 0) {
        // Botón comprar visible
        botonComprar.style.display = "block";
      } else {
        // Botón comprar invisible
        botonComprar.style.display = "none";
      }
      
      const botonesQuitar = document.querySelectorAll(".btnQuitar");
      
      for (const boton of botonesQuitar) {
        boton.addEventListener("click", (event) => {
          event.preventDefault();
          const idProducto = Number(boton.dataset.id);
          
          this.quitar(idProducto);
        });
      }
      // Actualizo los contadores del HTML
      spanCantidadProductos.innerText = this.cantidadProductos;
      spanTotalCarrito.innerText = this.total;
    }
  }
  
  // Elementos
  const spanCantidadProductos = document.querySelector("#cantidadProductos");
  const spanTotalCarrito = document.querySelector("#totalCarrito");
  const divProductos = document.querySelector("#productos");
  const divCarrito = document.querySelector("#carrito");
  const inputBuscar = document.querySelector("#inputBuscar");
  const botonCarrito = document.querySelector("section h1");
  const botonComprar = document.querySelector("#botonComprar");
  const botonesCategorias = document.querySelectorAll(".btnCategoria");
  
  // Instanciamos la base de datos
  const bd = new BaseDeDatos();
  
  // Instaciamos la clase Carrito
  const carrito = new Carrito();
  
  botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", () => {
      const categoria = boton.dataset.categoria;
      // Quitar seleccionado anterior
      const botonSeleccionado = document.querySelector(".seleccionado");
      botonSeleccionado.classList.remove("seleccionado");
      // Se lo agrego a este botón
      boton.classList.add("seleccionado");
      if (categoria == "Todos") {
        cargarProductos(bd.traerRegistros());
      } else {
        cargarProductos(bd.registrosPorCategoria(categoria));
      }
    });
  });
  
  // Mostramos el catálogo de la base de datos apenas carga la página
  cargarProductos(bd.traerRegistros());
  
  // Función para mostrar para renderizar productos del catálogo o buscador
  function cargarProductos(productos) {
    divProductos.innerHTML = "";

    for (const producto of productos) {
      divProductos.innerHTML += `
        <div class="producto">
          <div class="imagen">
            <img src="img/${producto.imagen}" />
          </div>
          <h2>${producto.nombre}</h2>
          <p class="precio">$${producto.precio}</p>
          <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
        </div>
      `;
    }
  
    // Lista dinámica con todos los botones que haya en nuestro catálogo
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
  
    for (const boton of botonesAgregar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        const idProducto = Number(boton.dataset.id);
        const producto = bd.registroPorId(idProducto);
        // Llama al método agregar del carrito
        carrito.agregar(producto);
        // Toastify
        Toastify({
          text: `Se ha añadido ${producto.nombre} al carrito`,
          gravity: "bottom",
          position: "center",
          style: {
            background: "linear-gradient(to right, rgb(84, 219, 84), rgb(178, 178, 178))",
          },
        }).showToast();
      });
    }
  }
  
  // Buscador
  inputBuscar.addEventListener("input", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = bd.registrosPorNombre(palabra);
    cargarProductos(productos);
  });
  
  // Toggle para ocultar/mostrar el carrito
  botonCarrito.addEventListener("click", (event) => {
    document.querySelector("section").classList.toggle("ocultar");
  });
  
  // Botón comprar
  botonComprar.addEventListener("click", (event) => {
    event.preventDefault();
  
    Swal.fire({
      title: "¿Seguro que desea comprar los productos?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, seguro",
      cancelButtonText: "No, no quiero",
    }).then((result) => {
      if (result.isConfirmed) {
        carrito.vaciar();
        Swal.fire({
          title: "¡Compra realizada!",
          icon: "success",
          text: "FELICITACIONES! Su compra fue realizada con éxito.",
          timer: 2000,
        });
      }
    });
  });