const version = "0.1.x.d"
let onlyNew = []
let all = []
window.onload = (event) => {
    if(localStorage.getItem("niedodata") == null) {
        let startingEls = [
            {"name": "Woda","emoji": "💧"},
            {"name": "Ogień","emoji": "🔥"},
            {"name": "Wiatr","emoji": "💨"},
            {"name": "Ziemia","emoji": "🌍"}
        ]
        for (let i = 0; i < startingEls.length; i++) {
            startingEls[i] = JSON.stringify(startingEls[i])
        }
        localStorage.setItem("niedodata", JSON.stringify(startingEls))
    }
    let elements = JSON.parse(localStorage.getItem("niedodata"))
    document.getElementById("searchfield").placeholder = "🔍 Wyszukaj obiekt (masz " + elements.length + " z ♾️ dostępnych)"
    parseData(elements)
    prepareSidebar(all)
    if (elements.length == 4) {
        const node = document.createElement("button")
        node.classList.add("listel", "paperbtn")
        node.id = "hint"
        node.innerText = "Kliknij na element lub przeciągnij i łącz w pary!"
        document.getElementById("sidebar").appendChild(node)
    }

    document.getElementById("searchfield").addEventListener("input", searchList)
    document.getElementById("onlyNew").addEventListener("change", changeArray)
    document.getElementById("clearBtn").onclick = function(){
        let els = document.getElementById("elements").getElementsByTagName("button")
        for(let i=els.length-1; i>=0; i--){
            els[i].remove();
        }
    }
    document.getElementById("pVersion").innerText = "Wersja: " + version;
    document.getElementById("aboutBtn").innerText = "💡" + version;
    document.getElementById("closeBtn").onclick = function (){closeBox("aboutBox")}
    document.getElementById("aboutBtn").onclick = function(){openBox("aboutBox")}
    document.getElementById("resetBtn").onclick = function(){openBox("resetBox")}
    document.getElementById("noBtn").onclick = function(){closeBox("resetBox")}
    document.getElementById("yesBtn").onclick = function(){resetGame()}
}

function parseData(elements) {
    elements.forEach(el => {
        el = JSON.parse(el)
        all.push(el)
        if(el.discovered){
            onlyNew.push(el)
        }
    })
}

function resetGame() {
    localStorage.removeItem("niedodata")
    location.reload()
}

function closeBox(id) {
    let box = document.getElementById(id)
    let overlay = document.getElementById("overlay")

    box.classList.add('notransition')
    for(let i=box.getElementsByTagName("button").length-1; i>=0;i--){
        let el = box.getElementsByTagName("button")[i]
        el.classList.add('notransition')
    }
    box.style.visibility="hidden"
    overlay.style.visibility="hidden"
    box.offsetHeight
    box.classList.remove('notransition')
    for(let i=box.getElementsByTagName("button").length-1; i>=0;i--){
        let el = box.getElementsByTagName("button")[i]
        el.classList.remove('notransition')
    }
}

function openBox(id) {
    document.getElementById("overlay").style.visibility="visible"
    document.getElementById(id).style.visibility="visible"
}

function changeArray(val) {
    console.log(val)
    if (val.target.checked) {
        prepareSidebar(onlyNew)
    }
    else {
        prepareSidebar(all)
    }
}

function searchList(val) {
    let onlyNewchckbx = document.getElementById("onlyNew")
    let arr = all
    let searchVal = val.target.value
    if(onlyNewchckbx.checked){
        arr = onlyNew
    }
    if(val.target.value == ""){
        prepareSidebar(all)
    }
    else {
        let filteredArr = []
        arr.forEach(el => {
            if(el.name.toLowerCase().includes(searchVal.toLowerCase())){
                filteredArr.push(el)
            }
        })
        filteredArr.sort(compareFn)
        prepareSidebar(filteredArr)
    }
}

function prepareSidebar(arr){
    let btns = document.getElementById("sidebar").getElementsByTagName("button")
    if(btns.length > 0){
        for (let i = btns.length-1; i >= 0; i--){
            btns[i].remove()
        }
    }
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i] 
        const node = document.createElement("button")
        node.classList.add("listel", "paperbtn")
        node.innerText = item.emoji + " " + item.name
        if(item.discovered){
            node.innerText += " ✨"
        }
        document.getElementById("sidebar").appendChild(node)
    }
}

function compareFn(a,b) {
    if (a.name < b.name) {
        return -1
    } else if (a.name > b.name) {
        return 1
    }
    return 0
}

interact('#sidebar').dropzone({
    accept: '.draggable',
    overlap: 0.5,
    ondrop: function (event) {
        event.relatedTarget.remove()
    }
})

interact('#menu').dropzone({
    accept: '.draggable',
    overlap: 0.2,
    ondrop: function (event) {
        event.relatedTarget.remove()
    }
})

interact('body')
.on('move', function(event){
    var target = document.getElementById("empty")
    const size = target.getBoundingClientRect()
    // keep the dragged position in the data-x/data-y attributes
    var x = event.clientX - size.width/2
    var y = event.clientY - size.height/2

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
})
.on('up', function(event){
    let end = performance.now()
    const elements = document.getElementById("elements")
    if(end - start > 150){
        let target = document.getElementById("empty")
        const mainContent = document.getElementById('main-content');
        const mainContentDims = mainContent.getClientRects()
        if (target.childNodes.length != 0){
            var child = target.childNodes[0]
            var el = document.elementsFromPoint(event.clientX, event.clientY)
            if (event.clientX <= mainContentDims.item(0).left){
                child.remove()
            }
            else{
                const size = child.getBoundingClientRect()
                const x = parseFloat(target.dataset.x) - size.width/2
                const y = parseFloat(target.dataset.y) - size.height/2
                child.setAttribute('data-x', x)
                child.setAttribute('data-y', y)
                child.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
                child.style.whiteSpace = ""
                elements.appendChild(child)
                if(el[0].nodeName == "BUTTON" && !el[1].classList.contains("menubtn") && el[1].nodeName == "BUTTON"){
                    generateNew(child,el[1])
                }
            }
        }
    }
    else if (newel) {
        const clone = newel.cloneNode(true);
        const mainContent = document.getElementById('main-content');
        const mainContentDims = mainContent.getClientRects()
        // clone.classList.remove('listel');
        clone.style.position = 'absolute';
        clone.style.left = `${event.clientX + mainContentDims.item(0).left}px`;
        clone.style.top = `${event.clientY}px`;
        elements.appendChild(clone);
        newel.remove()
    }
    elements.appendChild(document.getElementById("empty"))
})

function generateNew(firstTarget, secondTarget){
    if (secondTarget.disabled == false && firstTarget.disabled == false){
        firstTarget.disabled = true;
        secondTarget.disabled = true;

        const first = firstTarget.textContent
        const firstnoemoji = first.substr(first.indexOf(" ") + 1)
        const second = secondTarget.textContent
        const secondnoemoji = second.substr(second.indexOf(" ") + 1)
        fetch("generate?" + new URLSearchParams({
            first: firstnoemoji,
            second: secondnoemoji
        }), {method: "GET"})
            .then((response) => response.json())
            .then((json) => {
                let isNew = false
                let elements = JSON.parse(localStorage.getItem("niedodata"))
                if (json.discovered == true) {
                    isNew = true
                }
                else {
                    let found = false
                    for (let i = 0; i < elements.length; i++) {
                        item = JSON.parse(elements[i])
                        if(json.name == item.name){
                            found = true
                            break
                        }
                    }
                    isNew = !found
                }
                if (isNew){
                    let el = document.getElementById("hint");
                    if(el){
                        document.getElementById("hint").remove()
                    }
                    elements.push(JSON.stringify({name:json.name, emoji:json.emoji, discovered:json.discovered}))
                    localStorage.setItem("niedodata", JSON.stringify(elements))
                    const node = document.createElement("button")
                    node.classList.add("listel", "paperbtn")
                    node.innerText = json.emoji + " " + json.name
                    if (json.discovered) {
                        node.innerText += " ✨"
                    }
                    document.getElementById("sidebar").appendChild(node)
                    document.getElementById("searchfield").placeholder = "🔍 Wyszukaj obiekt (" + elements.length + " dostępne)"
                }
                firstTarget.innerText = json.emoji + " " + json.name
                if (json.discovered) {
                    firstTarget.innerText += " ✨"
                }
                firstTarget.disabled = false
                secondTarget.remove()
                }
            )
    }
}

let pendingClick;
let clicked = 0;
let time_dbclick = 150

interact('.draggable')
.dropzone({
    accept: [".draggable"],
    overlap: 0.2,
    ondrop: function(event) {
        generateNew(event.currentTarget, event.relatedTarget)
    }

})
.on('doubletap', function(event){
    const clone = event.currentTarget.cloneNode(true);
    const size = event.currentTarget.getBoundingClientRect()
    const elements = document.getElementById('elements');
    clone.style.position = 'absolute';
    const offset = randXY()
    const x =  size.left + offset.x
    const y =  size.top + offset.y


    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
    elements.appendChild(clone);
})
.on('tap', function(event){
    clicked++
    clearTimeout(pendingClick)
    if(clicked < 2){
        pendingClick = setTimeout(() => {
            event.currentTarget.remove()
            clicked = 0
        }, time_dbclick)
    } else {
        clicked = 0;
    }
})
.draggable({
    inertia: false,
    autoScroll: false,
    listeners: {
        start: startMove,
        move: dragMoveListener
    },
    modifiers: [
        interact.modifiers.restrict({
            restriction: document.body
        })
    ]
})
.pointerEvents({
    holdDuration: 50
});

function startMove(event){
    console.log(event)
}

function randXY(max = 10, min = 0){
    let obj = {};
    let randx = Math.random()*(max-min) + min;
    let randy = Math.random()*(max-min) + min;
    let xsign = Math.floor(Math.random()*2);
    let ysign = Math.floor(Math.random()*2);
    if (xsign == 0) { xsign = -1 }
    if (ysign == 0) { ysign = -1 }
    obj.x = randx * xsign;
    obj.y = randy * ysign;
    return obj
}

function dragMoveListener (event) {
    var target = event.target
    // const mainContent = document.getElementById('main-content');
    const mainContent = document.getElementById('elements');
    mainContent.appendChild(target)
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

let start
let newel
interact('#sidebar>.listel')
// .on('tap', function(event) {
//     const clone = event.currentTarget.cloneNode(true);
//     const mainContent = document.getElementById('main-content');
//     const mainContentDims = mainContent.getClientRects()
//     const elements = document.getElementById('elements');
//     // clone.classList.remove('listel');
//     clone.classList.add('draggable');
//     clone.style.position = 'absolute';
//     clone.style.left = `${event.clientX + mainContentDims.item(0).left}px`;
//     clone.style.top = `${event.clientY}px`;
//     elements.appendChild(clone);
// })
.on('down', function(event){
    start = performance.now()
    const clone = event.currentTarget.cloneNode(true);
    const empty = document.getElementById("empty")
    // clone.classList.remove('listel');
    clone.classList.add('draggable');
    clone.offsetHeight
    clone.style.whiteSpace = "pre"
    newel = clone
    empty.appendChild(clone)

    // var target = document.getElementById("empty")
    const size = event.currentTarget.getBoundingClientRect()
    // // keep the dragged position in the data-x/data-y attributes
    var x = size.width/-2
    var y = size.height/-2

    // // translate the element
    clone.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // // update the posiion attributes
    clone.setAttribute('data-x', x)
    clone.setAttribute('data-y', y)
})
.pointerEvents({
    holdDuration: 70
});
