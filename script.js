// ovaj blok koda linkuje html checkboxove i slajdere sa js fajlom da njihov input obradimo
const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
transparencySlider = document.querySelector("#transparency-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
lineEnding = document.querySelector("#line-end")
ctx = canvas.getContext("2d");

// globalne promenjive sa podrazumevanim vrednostima
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 15,
selectedColor = "#000";

const setCanvasBackground = () => {
    // postavljanje celog kanvasa na belu boju, da bu pozadina u slici koju preuzimamo bila bele boje
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // postavljamo fillstyle, tj boji ispunjenja objekta da bude jednaka boji cetke koju smo izabrali
}

window.addEventListener("load", () => {
    // podesavanje sirine i duzine canvasa, ffsetwidth/height vraca vidljivu duzinu/sirinu elementa 
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    // ako fillcolor nije cekiran, nacrtaj pravugaonik pomocu linija a ako jeste ispuni ga bojom
    if(!fillColor.checked) {
        // pravljeneje pravugaonika u odnosu na poziciju misa
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath(); // pravljenje novog path-a za iscrtavanje kruga
    // pravljenje kruga, ovde se uzima pozicija misa kada se klikne za centar, a poluprecnik se racuna oduzimanjem od trenutne duzine misa dok korisnik ne klikne da je zavrsio
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); //pravljenje kruga
    fillColor.checked ? ctx.fill() : ctx.stroke(); // kao u prethonom primeru za fillcolor(ispunjenost bojom)
}

const drawTriangle = (e) => {
    ctx.beginPath(); // kreira se novi path da se iscrta trougao
    ctx.moveTo(prevMouseX, prevMouseY); // pomeranje trougla na mis
    ctx.lineTo(e.offsetX, e.offsetY); // kreiranje prve linije u odnosu na mis
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // donja crta trougla
    ctx.closePath(); // samo se zatvara path tako da se treca linija sama zatvori
    fillColor.checked ? ctx.fill() : ctx.stroke(); // kao u prethodnim, proverava fillcolor da li je cekiran
}

const startDraw = (e) => {
    
    isDrawing = true;
    prevMouseX = e.offsetX; // dodeluje sadasnju mouseX poziciju kao prevMouseX vrednost
    prevMouseY = e.offsetY; // dodeljuje sadasnju mouseY poziciju kao prevMouseY vrednost
    ctx.beginPath(); // novi path se pravi za crtanje
    ctx.lineCap =lineEnding.checked ? "round" : "square";// postavlja vrh cetke u zavisnosti da li je opcija cekirana
  
    ctx.lineWidth = brushWidth; // dodeljuje brushSize kao debljinu cetke
    ctx.strokeStyle = selectedColor; // dodeljuje selectedColor as stroke stil
    ctx.fillStyle = selectedColor; // dodeljuje selectedColor kao fillstyle
    // kopira podatke na kanvasu i dodeljuje ih kao snapshot , ovako izbegavamo "povlacenje" slike
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) return; // ako je isDrawing false poziva se return i prekida program
    ctx.putImageData(snapshot, 0, 0); // dodeljuje kopirane podatke od kanvasa na novi kanvas

    if(selectedTool === "brush" || selectedTool === "eraser") {
        // ako je selectedTool gumica, stavlja boju crtanja na belu
        // a ako ne na boju koju smo izabrali
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;      
        ctx.lineTo(e.offsetX, e.offsetY); // pravi se linija na kanvasu u zavisnosti od pozicije misa
        ctx.stroke(); // crtanje linije
    } else if(selectedTool === "rectangle"){
        drawRect(e);
    } else if(selectedTool === "circle"){
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { // klik event
        // brisanje aktivne alatke i promena parametra na novu alatku koju smo kliknuli
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // dodeljivanje vrednosti slajdera debljini cetke
transparencySlider.addEventListener("change",() => ctx.globalAlpha= transparencySlider.value/100);
addEventListener("resize",(event)=> {});
onresize=(event) => {// kada se prozor u promeni velicina, treba osveziti stranicu jer se slika razvuce i izgleda lose
    alert("Prilikom Promene Velicine Prozora, Stranica Se Mora Osveziti, Na Zalost Izgubili Ste Dosanasnji Rad");
    window.location.reload();
};

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // novi klik event
        // brisanje prethodne klase i dodeljivanje kliknute
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        //selectedcolor se dodeljuje vrednost izabrane boje
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    // dodeljivanje boje iz color-pickera poslednjoj boji iz odabira (plavoj po defoltu)
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // dugme za brisanje celog kanvasa
    setCanvasBackground();
    ctx.globalAlpha= 1;// ako se transparentnost ne podesi na 1,  onda dilazimo do problema da novoobojen kanvas proziran i vide se stari crtezi ispod
    ctx.globalCompositeOperation ='destination-under'
    ctx.fillStyle= "#fff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); // Kreiranje "a" elementa
    link.download = `${Date.now()}.jpg`; // za preuzimanje slike, njen naziv ce biti sadasnji datum
    link.href = canvas.toDataURL(); //canvasData ce biti href vrednost linka
    link.click(); // klik na link za preuzimanje slike
});
console.log("javascript je obfuscatovan, za source code idite na github.com/petronijevicm");
canvas.addEventListener("mousedown", startDraw);// sluzi da znamo kada da crtamo a kada samo premestamo cetku
canvas.addEventListener("mousemove", drawing);//kada je pritisnut mis iscrtavamo
canvas.addEventListener("mouseup", () => isDrawing = false);//kada pustimo mis, samo se premesta



