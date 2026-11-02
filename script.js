/**
 * Created by joshwolfman on 5/6/19.
 */
const ENEMY = 0, NEUTRAL = 1, ALLY = 2;

function update() {
    const PL = parseFloat(document.getElementById("PL").value);
    const players = parseFloat(document.getElementById("size").value);
    const CR = [0, 0];
    for (const NPC of document.getElementsByClassName("NPC")) {
        let ePL = parseFloat(NPC.querySelector(".PL").value);
        if (NPC.querySelector(".rapid").checked) {
            ePL += 2;
        }
        addRank(CR, NPC.querySelector(".side").value, NPCRank(ePL, PL), NPC.querySelector(".number").value);
    }
    for (const minion of document.getElementsByClassName("minion")) {
        const ePL = parseFloat(minion.querySelector(".PL").value);
        const num = parseFloat(minion.querySelector(".number").value) *
            (parseFloat(minion.querySelector(".tier").value) + 1);
        addRank(CR, minion.querySelector(".side").value, minionRank(ePL, PL, num), 1);
    }
    for (const force of document.getElementsByClassName("force")) {
        const qPL = parseInt(force.querySelector(".quality").value) + 3;
        const size = parseInt(force.querySelector(".size").value);
        const ePL = qPL + size - 1;
        addRank(CR, force.querySelector(".side").value, NPCRank(ePL, PL), parseInt(force.querySelector(".number").value));
    }
    CR[0] = Math.ceil(CR[0]);
    CR[1] = Math.ceil(CR[1]);
    const CRValue = document.getElementById("CRValue");
    const diffValue = document.getElementById("diffValue");
    if (CR[0] == CR[1]) {
        CRValue.textContent = CR[0];
        diffValue.textContent = danger(CR[0], players);
    } else {
        CRValue.textContent = CR[0] + "–" + CR[1];
        const low = danger(CR[0], players);
        const high = danger(CR[1], players);
        diffValue.textContent = low == high ? low : low + " – " + high;
    }
}

// Adds an entry's rank to the running [low, high] Challenge Rank `times` times. Allies count against the
// encounter and neutral parties count for half, so the total is flipped or doubled while the rank is added
// and then put back.
function addRank(CR, side, rank, times) {
    for (let i = 0; i < CR.length; i++) {
        if (side == ALLY) {
            CR[i] *= -1;
        } else if (side == NEUTRAL) {
            CR[i] *= 2;
        }
        for (let n = 0; n < times; n++) {
            CR[i] += rank[i];
        }
        if (side == ALLY) {
            CR[i] *= -1;
        } else if (side == NEUTRAL) {
            CR[i] /= 2;
        }
    }
}

/*
 NPC's Challenge Rank: NPC's Power Level
 Challenge Rank 1: Party's PL -4 or lower
 Challenge Rank 2: Party's PL -2 or -3
 Challenge Rank 3: Party's PL -1
 Challenge Rank 4: Party's PL
 Challenge Rank 5-6: Party's PL + 1
 Challenge Rank 7-9: Party's PL + 2
 Challenge Rank 10-13: Party's PL + 3
 Challenge Rank 14-19: Party's PL + 4
 Challenge Rank 20+: Party's PL + 5
 */
function NPCRank(ePL, PL) {
    if (ePL == PL - 4) {
        return [1, 1];
    } else if (ePL <= PL - 2) {
        return [2, 2];
    } else if (ePL == PL - 1) {
        return [3, 3];
    } else if (ePL == PL) {
        return [4, 4];
    } else if (ePL == PL + 1) {
        return [5, 6];
    } else if (ePL == PL + 2) {
        return [7, 9];
    } else if (ePL == PL + 3) {
        return [10, 13];
    } else if (ePL == PL + 4) {
        return [14, 19];
    } else {
        return [Math.ceil(3.85056 * Math.E ** (.319568 * (ePL - PL))),
            Math.ceil(4.24811 * Math.E ** (.373671 * (ePL - PL)))];
    }
}

/*
 Party PL-8= 16 minions for 1 challenge rank
 Party PL-7= 12 minions for 1 challenge rank
 Party PL-6= 8 minions for 1 challenge rank
 Party PL-5= 6 minions for 1 challenge Rank
 Party PL-4= 4 minions for 1 challenge rank
 Party PL-3= 3 minions for 1 challenge rank
 Party PL-2= 2 minions for 1 challenge rank
 Party PL-1 to Party PL= 1 minion for 1 challenge rank
 */
function minionRank(ePL, PL, num) {
    let rank;
    if (ePL <= PL - 8) {
        rank = num / 16;
    } else if (ePL <= PL - 7) {
        rank = num / 12;
    } else if (ePL <= PL - 6) {
        rank = num / 8;
    } else if (ePL <= PL - 5) {
        rank = num / 6;
    } else if (ePL <= PL - 4) {
        rank = num / 4;
    } else if (ePL <= PL - 3) {
        rank = num / 3;
    } else if (ePL <= PL - 2) {
        rank = num / 2;
    } else if (ePL <= PL) {
        rank = num;
    } else {
        rank = Math.ceil(num / (1.03683 * Math.E ** (-.344073 * (ePL - PL))));
    }
    return [rank, rank];
}

function danger(CR, players) {
    const DR = Math.floor(CR / players);
    switch (DR) {
        case 0:
        case 1:
        case 2:
            return "No Danger (" + DR + ")";
        case 3:
            return "Minimal Danger (" + DR + ")";
        case 4:
            return "Modest Danger (" + DR + ")";
        case 5:
            return "Significant Danger (" + DR + ")";
        case 6:
            return "Serious Danger (" + DR + ")";
        case 7:
            return "Severe Danger (" + DR + ")";
        case 8:
            return "Overwhelming Danger (" + DR + ")";
        default:
            return "Exceeds danger ranks (" + DR + ")";
    }
}

function add(type) {
    const row = document.createElement("div");
    row.className = type;
    row.appendChild(makeField("Name:", makeInput("text", "name")));
    if (type == "force") {
        row.appendChild(makeSelect("quality", ["Green", "Trained", "Veteran"], "Quality"));
        row.appendChild(makeField("Size:", makeInput("number", "size")));
        row.appendChild(makeField("Number:", makeInput("number", "number")));
    } else {
        row.appendChild(makeField("PL:", makeInput("number", "PL")));
        row.appendChild(makeField("Number:", makeInput("number", "number")));
        if (type == "NPC") {
            row.appendChild(makeField("Rapid-Fire:", makeInput("checkbox", "rapid")));
        } else {
            row.appendChild(makeField("Tier:", makeSelect("tier", ["Bruise", "Daze", "Stagger"])));
        }
    }
    row.appendChild(makeSelect("side", ["Enemy", "Neutral", "Ally"], "Side"));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
        row.remove();
        update();
    });
    row.appendChild(remove);
    document.getElementById(type).appendChild(row);
    update();
}

function makeField(text, control) {
    const label = document.createElement("label");
    label.append(text, control);
    return label;
}

function makeInput(type, className) {
    const input = document.createElement("input");
    input.type = type;
    input.className = className;
    if (type == "number") {
        input.min = 1;
        input.value = 1;
    }
    return input;
}

// Option values are their index in `options`.
function makeSelect(className, options, label) {
    const select = document.createElement("select");
    select.className = className;
    if (label) {
        select.setAttribute("aria-label", label);
    }
    options.forEach(function (text, value) {
        select.add(new Option(text, value));
    });
    return select;
}

function clearList(...ids) {
    for (const id of ids) {
        document.getElementById(id).textContent = "";
    }
    update();
}

function toggleTutorial() {
    const popup = document.getElementById("popup");
    popup.hidden = !popup.hidden;
    document.getElementById("guide").setAttribute("aria-expanded", !popup.hidden);
}

document.addEventListener("input", update);
document.addEventListener("change", update);
// Browsers can restore typed values without firing input events, e.g. when going back to the page.
window.addEventListener("pageshow", update);
document.getElementById("guide").addEventListener("click", toggleTutorial);
document.getElementById("popup").addEventListener("click", toggleTutorial);
update();
