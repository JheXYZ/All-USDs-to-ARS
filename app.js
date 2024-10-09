const fechasDOM = document.querySelectorAll('.fecha');
const comprasDOM = document.querySelectorAll('.compra');
const ventasDOM = document.querySelectorAll('.venta');
const formsDOM = document.querySelectorAll('.compra-dolar');
const toggleButtonsDOM = document.querySelectorAll('.checkbox');

class Dolar {
    constructor(fechaDOM, compraDOM, ventaDOM, formDOM, toggleButtonDOM) {
        this.fecha = fechaDOM;
        this.compraDOM = compraDOM;
        this.compra = 0;
        this.ventaDOM = ventaDOM;
        this.venta = 0;
        this.currentOperation = "";
        this.formUSD = formDOM.querySelector('[name="usd"]');
        this.formARS = formDOM.querySelector('[name="ars"]');
        this.toggleButton = toggleButtonDOM;
    }

    #formatearPrecio(precio = 0) {
        return Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2}).format(precio);
    }

    render(dolar) {
        this.fecha.textContent = getTimeDifference(new Date(dolar.fechaActualizacion)) + ` (${new Date(dolar.fechaActualizacion).toLocaleString('es-ar', { minute: '2-digit', hour: '2-digit', day: '2-digit', month: 'short' })})`;
        this.compraDOM.textContent = this.#formatearPrecio(dolar.compra);
        this.compra = dolar.compra;
        this.ventaDOM.textContent = this.#formatearPrecio(dolar.venta);
        this.venta = dolar.venta;
        this.currentOperation = "compra";
        this.formARS.placeholder = dolar.compra.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.loadFunctionality();
    }

    loadFunctionality() {
        this.formUSD.addEventListener('input', this.convertCurrency.bind(this, "usd"));
        this.formARS.addEventListener('input', this.convertCurrency.bind(this, "ars"));
        this.toggleButton.addEventListener("click", this.toggleCurrency.bind(this));
    }

    convertCurrency(currency) {
        const isUSD = currency === "usd";
        const sourceInput = isUSD ? this.formUSD : this.formARS;
        const targetInput = isUSD ? this.formARS : this.formUSD;
        const value = parseFloat(sourceInput.value.replace(/[^0-9,]/g, '').replace(',', '.'));
        
        if (!value) {
            this.formUSD.value = "";
            this.formARS.value = "";
            return;
        }

        const result = this.convertResult(isUSD, value, this.currentOperation);
        targetInput.value = result;
    }

    toggleCurrency() {
        this.currentOperation = this.currentOperation === "compra" ? "venta" : "compra";
        if (this.currentOperation === "compra")
            this.formARS.placeholder = this.compra.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        else if (this.currentOperation === "venta")
            this.formARS.placeholder = this.venta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.formUSD.value = "";
        this.formARS.value = "";
    }

    convertResult(isUSD, value, currentOperation, min, max) {
        return (isUSD ? value * (currentOperation === "compra" ? this.compra : this.venta) : value / (currentOperation === "compra" ? this.compra : this.venta))
            .toLocaleString('es-AR', { minimumFractionDigits: min || 2, maximumFractionDigits: !isUSD ? 5 : (max || 2) });
    }

}

function loadMap() {
    if (!(fechasDOM.length === comprasDOM.length && comprasDOM.length === ventasDOM.length && ventasDOM.length === formsDOM.length && formsDOM.length === toggleButtonsDOM.length)) {
        console.error("Error: No se cargaron los elementos correctamente");
        return;
    }
    const dolarHouses = ["oficial", "blue", "bolsa", "cripto", "tarjeta"];
    const dolarMap = new Map();
    dolarHouses.forEach((dolarHouse, index) => dolarMap.set(dolarHouse, new Dolar(fechasDOM[index], comprasDOM[index], ventasDOM[index], formsDOM[index], toggleButtonsDOM[index])));
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

function getTimeDifference(date = new Date()) {
    const difference = Date.now() - date;
    const minutes = Math.floor(difference / 60000);
    if (minutes < 60)
        return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours} hora${hours > 1 ? "s" : ""} y ${minutes - hours * 60} minutos`;
    const days = Math.floor(hours / 24);
    return `${days} día${days > 1 ? "s" : ""} y ${hours - days * 24} horas`;
}


main()

