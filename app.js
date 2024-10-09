const fechasDOM = document.querySelectorAll('.fecha');
const comprasDOM = document.querySelectorAll('.compra');
const ventasDOM = document.querySelectorAll('.venta');
const formsDOM = document.querySelectorAll('.compra-dolar');

class Dolar {
    constructor(fechaDOM, compraDOM, ventaDOM, formDOM) {
        this.fecha = fechaDOM;
        this.compraDOM = compraDOM;
        this.compra = 0;
        this.ventaDOM = ventaDOM;
        this.venta = 0;
        this.formUSD = formDOM.querySelector('[name="usd"]');
        this.formARS = formDOM.querySelector('[name="ars"]');
    }

    #formatearPrecio(precio = 0) {
        return Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2}).format(precio);
    }

    render(dolar) {
        this.fecha.textContent = new Date(dolar.fechaActualizacion).toLocaleString('es-ar', { minute: '2-digit', hour: '2-digit', day: '2-digit', month: 'short' });
        this.compraDOM.textContent = this.#formatearPrecio(dolar.compra);
        this.compra = dolar.compra;
        this.ventaDOM.textContent = this.#formatearPrecio(dolar.venta);
        this.venta = dolar.venta;
        this.formARS.placeholder = dolar.compra.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.#loadFunctionality();
    }

    #loadFunctionality() {
        this.formUSD.addEventListener('input', this.#convertCurrency.bind(this, "usd"));
        this.formARS.addEventListener('input', this.#convertCurrency.bind(this, "ars"));
    }

    #convertCurrency(currency) {
        // debugger;
        const isUSD = currency === "usd";
        const sourceInput = isUSD ? this.formUSD : this.formARS;
        const targetInput = isUSD ? this.formARS : this.formUSD;
        const value = parseFloat(sourceInput.value.replace(/[^0-9,]/g, '').replace(',', '.'));
        
        if (!value) {
            this.formUSD.value = "";
            this.formARS.value = "";
            return;
        }

        const result = this.#convertResult(isUSD, value);
        targetInput.value = result;
    }

    #convertResult(isUSD, value, min, max) {
        return (isUSD ? value * this.compra : value / this.compra).toLocaleString('es-AR', { minimumFractionDigits: min || 2, maximumFractionDigits: !isUSD ? 5 : (max || 2) });
    }

}

function loadMap() {
    if (!(fechasDOM.length === comprasDOM.length && comprasDOM.length === ventasDOM.length && ventasDOM.length === formsDOM.length)) {
        console.error("Error: No se cargaron los elementos correctamente");
        return;
    }
    const dolarHouses = ["oficial", "blue", "bolsa", "cripto", "tarjeta"];
    const dolarMap = new Map();
    dolarHouses.forEach((dolarHouse, index) => dolarMap.set(dolarHouse, new Dolar(fechasDOM[index], comprasDOM[index], ventasDOM[index], formsDOM[index])));
    return dolarMap;
}

const dolarMap = loadMap();


async function fetchDolars() {
    const res = await fetch("https://dolarapi.com/v1/dolares");
    return await res.json();
}

async function main() {
    const response = await fetchDolars();
    const dolarList = response.filter(({ casa }) => casa !== "mayorista" && casa !== "contadoconliqui")
    renderDolars(dolarList);

}

function renderDolars(dolarList) {
    dolarList.forEach((dolar) => dolarMap.get(dolar.casa).render(dolar))
}


main()

