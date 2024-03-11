class DessinLancer {
    constructor(canevas) {
        this._canvas = canevas;
        this._context = canevas.getContext('2d');
        this._width = canevas.width;
        this._height = canevas.height;
    }
    clear() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    dessiner(lancers) {
        for (let i = 0; i < lancers.length; i++) {
            this.dessinerLancer(lancers[i]);
        }
    }
    dessinerLancer(lancer) {
        let scaledx = lancer.x * this._width;
        let scaledy = this._height - lancer.y * this._height;

        if (lancer.estDansCercle) {
            //this._context.fillStyle = "green";
            this._context.fillStyle = "rgba(0, 255, 0, 0.005)";
        } else {
            //this._context.fillStyle = "rgba(255, 0, 0, 0.005)";
            this._context.fillStyle = "rgba(0, 0, 0, 0.01)";
//            this._context.fillStyle = "red";
        }

        this._context.fillRect(scaledx, scaledy, 1, 1);
    }
}

class BarreProgression {
    constructor(canevas) {
        this._canvas = canevas;
        this._context = canevas.getContext('2d');
        this._width = canevas.width;
        this._height = canevas.height;
    }

    dessinerBarreProgression(valeur) {
        this._context.fillStyle = 'blue';
        this._context.fillRect(0, 0, this._width * valeur, this._height);
    }
}

class MonteCarloPI {
    constructor(heatMap, lancer, evaluationPiCallback) {
        this._heatMap = heatMap;
        this._lancer = lancer;
        this._evaluationPiCallback = evaluationPiCallback;
        this.init();
    }
    set generateurAleatoire(generateurAleatoire) {
        this._generateurAleatoire = generateurAleatoire;
        this.init();
    }
    get iterationCourante() {
        return this._iterationCourante;
    }
    get nombreIterations() {
        return this._nombreIterations;
    }
    set nombreIterations(nombreIterations) {
        this._nombreIterations = nombreIterations;
        this.init();
    }
    init() {
        this._iterationCourante = 0;
        this._nombrePointsDansCercle = 0;
        this._heatMap.clear();
        this._lancer.clear();
    }
    get evaluationPi() {
        return (this._iterationCourante == 0) ? 0 : 4 * this._nombrePointsDansCercle / this._iterationCourante;
    }

    anime(timestamp) {
        const lancers = [];
        for (let i = 0; i < this._nbLancers60FPS && this._iterationCourante < this._nombreIterations; ++i) {
            ++this._iterationCourante;
            const lancer = this.effectuerLancer();
            if (lancer.estDansCercle) {
                ++this._nombrePointsDansCercle;
            }
            lancers.push(lancer);
        }
        this._heatMap.integrer(lancers);
        this._lancer.dessiner(lancers);
        this._evaluationPiCallback(this);
        if (this._iterationCourante < this._nombreIterations) {
            this._animationId = window.requestAnimationFrame(this.anime.bind(this));
        } else {
            console.log("done");
        }
    }

    evaluationNombreLancers60FPS() {
        this.init();
        let generateurAleatoireCourant = this._generateurAleatoire;
        let generateurAleatoire =  () => { return { x: Math.random(), y : Math.random() }; };
        this._generateurAleatoire = generateurAleatoire;
        const startTime = performance.now();
        let lancers = [];
        let nombreIterationsATester = 400_000;
        for (let i = 0; i < nombreIterationsATester; i++) {
            lancers.push(this.effectuerLancer());
        }
        this._heatMap.integrer(lancers);
        this._lancer.dessiner(lancers);
        this._evaluationPiCallback(this);
        const endTime = performance.now();

        this._generateurAleatoire = generateurAleatoireCourant;

        console.log(`Temps d'exécution : ${endTime - startTime} ms pour ${nombreIterationsATester.toLocaleString()} lancers`);
        this._nbLancers60FPS = Math.floor(1_000 / 60 * nombreIterationsATester / (endTime - startTime));
        console.log(`Nombre de lancers pour 60FPS (16,666ms) : ${this._nbLancers60FPS}`);
    }

    demarrer() {
        this.init();

        this._nbLancers60FPS = 100000;
        this._animationId = window.requestAnimationFrame(this.anime.bind(this));
    }

    effectuerLancer() {
        const {x, y} = this._generateurAleatoire();

        return { x, y, estDansCercle: x * x + y * y <= 1 };
    }
}

class HeatMap {
    constructor(canevas, echelle) {
        this._canvas = canevas;
        this._context = canevas.getContext('2d');
        this._echelle = echelle;
        this._width = canevas.width;
        this._height = canevas.height;
    }
    clear() {
        this._context.clearRect(0, 0, this._width, this._height);
        this._heatMap = 
            new Array(
                Math.trunc(this._width / this._echelle) 
              * Math.trunc(this._height / this._echelle)
            ).fill(0);
    }
    integrer(lancers) {
        const largeurLigne = Math.trunc(this._width / this._echelle)
        for (let i = 0; i < lancers.length; i++) {
            const lancer = lancers[i];
            // let scaledx = lancer.x * this._width;
            // let scaledy = this._height - lancer.y * this._height;
            // scaledx = Math.trunc(scaledx / this._echelle);
            // scaledy = Math.trunc(scaledy / this._echelle);
            let scaledx = Math.trunc(lancer.x * (this._width / this._echelle));
            let scaledy = Math.trunc((1 - lancer.y) * (this._height / this._echelle));
    
            let index = Math.min(scaledx, largeurLigne - 1) + Math.min(scaledy, largeurLigne - 1) * largeurLigne;
            if (index >= this._heatMap.length) {
                console.log("index out of range");
                console.log(`index : ${index}`);
                console.log(`largeurLigne : ${largeurLigne}`);
                console.log(`scaledx : ${scaledx}`);
                console.log(`scaledy : ${scaledy}`);
                console.log(`lancer.x : ${lancer.x}`);
                console.log(`lancer.y : ${lancer.y}`);
                console.log(`this._width : ${this._width}`);
                console.log(`this._height : ${this._height}`);
                console.log(`this._echelle : ${this._echelle}`);
                console.assert(false);
            }

            ++this._heatMap[index];
        }

        this.dessiner();
    }
    get valeurMax() {
        //console.log(this._heatMap);
        return this._heatMap.reduce((a, b) => Math.max(a, b), -Infinity);
        //return Math.max(...this._heatMap);
    }
    get valeurMin() {
        return this._heatMap.reduce((a, b) => Math.min(a, b), Infinity);
        //return Math.min(...this._heatMap);
    }
    dessiner() {
        const largeurLigne = Math.trunc(this._width / this._echelle);
        let valeurMax = this.valeurMax;
        let valeurMin = this.valeurMin;

        let echelleCouleurs = 50;

        for (let x = 0; x < largeurLigne; x++) {
            for (let y = 0; y < largeurLigne; y++) {
                let valeur = this._heatMap[x + y * largeurLigne];
                valeur = (valeur - valeurMin) / (valeurMax - valeurMin);
                valeur = Math.round(valeur * echelleCouleurs) / echelleCouleurs;

                this._context.fillStyle = "hsl(" + (valeur * 150) + ", 100%, 50%)";
                this._context.fillRect(x * this._echelle, y * this._echelle, this._echelle, this._echelle);
            }
        }
    }
}

window.addEventListener('load', function () {
    const canevasLancer = document.getElementById('lancer');
    const canevasHeatMap = document.getElementById('heatMap');
    const evaluationPi = document.getElementById('evaluationPi');
    const avancementLancers = document.getElementById('avancementLancers');
    const nbLancers = document.getElementById('nbLancers');
    const barreProgression = new BarreProgression(avancementLancers);
    const majEvaluationPi = (moteur) => {
        evaluationPi.innerHTML = moteur.evaluationPi + "<br/>Erreur : " + Math.abs(Math.PI - moteur.evaluationPi);
        nbLancers.innerHTML = moteur.iterationCourante.toLocaleString() + "/" + moteur.nombreIterations.toLocaleString() + " lancers (Min : " + heatMap.valeurMin + " ; Max : " + heatMap.valeurMax + " ; Diff : " + (heatMap.valeurMax - heatMap.valeurMin) + ")"; 
        barreProgression.dessinerBarreProgression(moteur.iterationCourante / moteur.nombreIterations);
    };

    const dessinLancer = new DessinLancer(canevasLancer);
    const heatMap = new HeatMap(canevasHeatMap, 20);
    const monteCarloPI = new MonteCarloPI(heatMap, dessinLancer, majEvaluationPi);

    monteCarloPI.nombreIterations = 1_000_000_000;
    generateurAleatoire =  () => { return { x: Math.random(), y : Math.random() }; };
    // let x = 0;
    // let y = 0;
    // let dxy = 1;
    // let dfacteur = 2;
    // let nbGen = 0;
    // generateurmultiechel =  () => {
    //     nbGen++;
    //     let result = { x, y };
    //     x += dxy;
    //     if (x >= 1) {
    //         x = 0;
    //         y += dxy;
    //         if (y >= 1) {
    //             y = 0;
    //             dxy = dxy / dfacteur;
    //             console.log("PI : " + monteCarloPI.evaluationPi);
    //             console.log("nbGen : " + nbGen);
    //             if (dxy < 0.0001) {
    //                 monteCarloPI._nombreIterations = monteCarloPI.iterationCourante;
    //             }
    //         }
    //     }

    //     //console.log(result);

    //     return result; 
    // };

    monteCarloPI.generateurAleatoire = generateurAleatoire;

    //monteCarloPI.nombreIterations = Infinity;
    //monteCarloPI.generateurAleatoire = generateurmultiechel;

    monteCarloPI.evaluationNombreLancers60FPS();
    monteCarloPI.demarrer();
});