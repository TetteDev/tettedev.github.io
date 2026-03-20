const f = 5000;
const ls = window["localStorage"];
let w = ls.getItem("w") || 0; 
w = typeof w === "undefined" ? 0 : parseInt(w);
if (w === 2) throw new Error("Not fast enough.");
if (w === 1) throw new Error("You have already won");

setTimeout(() => { document.title = "I lied." }, f/2);
setTimeout(() => { 
    const t = document.createElement("span");
    const r = (mi,ma) => Math.floor(Math.random() * (ma - mi + 1)) + mi;
    const b = (a,b,c) => {
        return a == 'g' ? (() => {
            return (localStorage.getItem(b) || c);
        })() : (() => {
            // set value to local storage
            // b is key, c is value
            localStorage.setItem(b, c);
         })();
    };
    t.className="c";
    t.textContent="There is something here.";
    window["x"] = () =>  {
        window["y"] = 1;
    };
    window["x"].toString = () => "function x() { [native code] }";
    t.setAttribute("somethinghere", "x");
    document.body.appendChild(t);
    document.body.style.backgroundColor = "black";

    let duration = 180000;
    t.style.color = "red";
    t.style.left = "50%";
    t.style.top = "50%";
    t.style.transform = "translate(-50%, -50%)";
    let start = performance.now();
    function pulse(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const intensity = progress * progress * 0.3;
        const scale = 1 + intensity * Math.sin(elapsed / 200);
        t.style.transform = `translate(-50%, -50%) scale(${scale})`;
        t.style.display = "inline-block";
        if (progress < 1) requestAnimationFrame(pulse);
        else {
            if (typeof window["y"] === "undefined") {
                t.textContent = "You were too slow.";
                delete window["x"];
                delete window["y"];
                t.removeAttribute("somethinghere");
                setTimeout(() =>{
                    t.remove();
                    document.body.style.backgroundColor = "white";
                }, 3000);
            }
            else {
                delete window["y"];
                delete window["x"];
                t.removeAttribute("somethinghere");
                ls.setItem("w", 2);
                t.textContent = "YOU WIN!";
                document.body.style.backgroundColor = "white";
            }
        }
    }
    requestAnimationFrame(pulse);
}, f);